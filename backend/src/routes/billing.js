import {
  activateSubscription,
  getCurrentSubscription,
  renewalAvailable,
  matchesCapturedSubscriptionPayment,
} from "../services/subscriptionValidity.js";
import { getTemplateConfig } from "../config/templates.js";
import templateBilling from "./templateBilling.js";
import TemplatePurchase from "../models/TemplatePurchase.js";
import {
  hasTemplateAccess,
  templatePaymentRequired,
} from "../services/templateAccess.js";
import { Router } from "express";
import crypto from "node:crypto";
import Subscription from "../models/Subscription.js";
import Portfolio from "../models/Portfolio.js";
import { protect } from "../middleware/auth.js";
import Razorpay from "razorpay";
import { getPlanById } from "../config/plans.js";
import {
  isPortfolioReadyToPublish,
  publishPortfolioAfterPayment,
} from "../services/publishing.js";
const r = Router();
r.use(protect);
r.use("/templates", templateBilling);
r.post("/order", async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ ownerId: req.user._id });
    const renewing = req.body?.renew === true;
    if (
      renewing &&
      !renewalAvailable(await getCurrentSubscription(req.user._id))
    )
      return res
        .status(400)
        .json({
          message:
            "You can upgrade validity when fewer than 30 days remain, or after your plan expires.",
        });
    if (!renewing && !isPortfolioReadyToPublish(portfolio))
      return res.status(400).json({
        message:
          "Complete your name, contact number, personal address, and design before payment.",
      });

    if (
      !renewing &&
      !(await hasTemplateAccess(req.user._id, portfolio.templateId))
    )
      return res.status(402).json(templatePaymentRequired);
    const cfg = getPlanById(req.body?.planId);

    if (!cfg)
      return res.status(400).json({
        message: "Choose one of the available subscription plans.",
      });

    if (!Number.isFinite(cfg.amount) || cfg.amount <= 0)
      return res.status(503).json({
        message: `Set a positive amount for ${cfg.name} in backend/.env before checkout.`,
      });
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.PAYMENT_SIMULATION_ENABLED === "true"
    ) {
      const orderId = `sim_${crypto.randomUUID()}`;
      await Subscription.create({
        ownerId: req.user._id,
        status: "pending",
        provider: "simulation",
        orderId,
        planId: cfg.id,
        planName: cfg.name,
        amount: cfg.amount,
        currency: cfg.currency,
        periodDays: cfg.periodDays,
        renewal: renewing,
      });
      return res.json({
        mode: "simulation",
        orderId,
        plan: cfg,
        label: "Simulated development payment",
      });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return res.status(503).json({
        message:
          "Payments are not configured. Enable local simulation in backend/.env for development.",
      });
    const rp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await rp.orders.create({
      amount: Math.round(cfg.amount * 100),
      currency: cfg.currency,
      receipt: `pb_${req.user.id.slice(-10)}_${Date.now()}`,
      notes: { ownerId: req.user.id, planId: cfg.id, plan: cfg.name },
    });
    await Subscription.create({
      ownerId: req.user._id,
      status: "pending",
      provider: "razorpay",
      orderId: order.id,
      planId: cfg.id,
      planName: cfg.name,
      amount: cfg.amount,
      currency: cfg.currency,
      periodDays: cfg.periodDays,
      renewal: renewing,
    });
    res.json({
      mode: "razorpay",
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: cfg,
    });
  } catch (e) {
    next(e);
  }
});
r.post("/simulate-success", async (req, res, next) => {
  try {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.PAYMENT_SIMULATION_ENABLED !== "true"
    )
      return res.status(404).json({ message: "Not found." });
    const sub = await Subscription.findOne({
      ownerId: req.user._id,
      orderId: req.body.orderId,
      provider: "simulation",
    });
    if (!sub)
      return res.status(404).json({ message: "Simulated checkout not found." });
    await activateSubscription(
      sub,
      sub.paymentId || `sim_pay_${crypto.randomUUID()}`,
    );
    const subscription = await getCurrentSubscription(req.user._id);
    const publishing = await publishPortfolioAfterPayment(req.user._id);
    res.json({
      subscription,
      serverTime: new Date().toISOString(),
      simulated: true,
      ...publishing,
    });
  } catch (e) {
    next(e);
  }
});
r.post("/verify", async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
      return res
        .status(503)
        .json({ message: "Payments are currently unavailable." });
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    )
      return res
        .status(400)
        .json({ message: "Invalid payment verification details." });
    const sub = await Subscription.findOne({
      ownerId: req.user._id,
      orderId: razorpay_order_id,
      provider: "razorpay",
    });
    if (!sub)
      return res.status(404).json({ message: "Payment order not found." });
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected),
      b = Buffer.from(String(razorpay_signature || ""));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
      return res.status(400).json({ message: "Payment verification failed." });
    const rp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const payment = await rp.payments.fetch(razorpay_payment_id);
    if (!matchesCapturedSubscriptionPayment(payment, sub))
      return res
        .status(409)
        .json({
          message:
            "Payment confirmation is pending. If you were charged, refresh shortly; your validity will update after confirmation.",
        });
    await activateSubscription(sub, razorpay_payment_id);
    const subscription = await getCurrentSubscription(req.user._id);
    const publishing = await publishPortfolioAfterPayment(req.user._id);
    res.json({
      subscription,
      serverTime: new Date().toISOString(),
      ...publishing,
    });
  } catch (e) {
    next(e);
  }
});
r.get("/history", async (req, res, next) => {
  try {
    const records = await Subscription.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-processedEvents -__v")
      .lean();
    const purchases = await TemplatePurchase.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();
    const templateRecords = purchases.map((p) => ({
      ...p,
      kind: "template",
      planName: getTemplateConfig(p.templateId)?.name || p.templateId,
    }));
    res.json({
      payments: [...records, ...templateRecords].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    });
  } catch (e) {
    next(e);
  }
});
export default r;
