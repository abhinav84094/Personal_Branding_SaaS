import { Router } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import TemplatePurchase from "../models/TemplatePurchase.js";
import { getTemplateConfig } from "../config/templates.js";
import {
  hasTemplateAccess,
  matchesCapturedTemplatePayment,
  completeTemplatePurchase,
} from "../services/templateAccess.js";
const r = Router();
const simulationEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.PAYMENT_SIMULATION_ENABLED === "true";
const razorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
r.post("/order", async (req, res, next) => {
  try {
    const cfg = getTemplateConfig(req.body?.templateId);
    if (!cfg?.premium)
      return res
        .status(400)
        .json({ message: "Choose an animated premium template." });
    if (await hasTemplateAccess(req.user._id, cfg.id))
      return res.status(409).json({
        message: "You already own this template. Refresh your template list.",
      });
    if (!cfg.purchasable)
      return res
        .status(503)
        .json({
          message:
            "Template purchases are temporarily unavailable. Please try again later.",
        });
    const simulated = simulationEnabled();
    if (
      !simulated &&
      (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    )
      return res.status(503).json({
        message:
          "Template payments are currently unavailable. Please try again later.",
      });
    const pending = await TemplatePurchase.findOne({
      ownerId: req.user._id,
      templateId: cfg.id,
      status: "pending",
      amount: cfg.amount,
      currency: cfg.currency,
      provider: simulated ? "simulation" : "razorpay",
    });
    if (pending)
      return res.json({
        mode: simulated ? "simulation" : "razorpay",
        orderId: pending.orderId,
        ...(!simulated ? { keyId: process.env.RAZORPAY_KEY_ID } : {}),
        template: {
          ...cfg,
          amount: pending.amount,
          currency: pending.currency,
        },
      });
    const order = simulated
      ? { id: "tpl_sim_" + crypto.randomUUID() }
      : await razorpay().orders.create({
          amount: Math.round(cfg.amount * 100),
          currency: cfg.currency,
          receipt: "tpl_" + crypto.randomUUID().slice(0, 24),
          notes: {
            ownerId: String(req.user._id),
            templateId: cfg.id,
            purpose: "template",
          },
        });
    await TemplatePurchase.create({
      ownerId: req.user._id,
      templateId: cfg.id,
      provider: simulated ? "simulation" : "razorpay",
      orderId: order.id,
      amount: cfg.amount,
      currency: cfg.currency,
    });
    res.json({
      mode: simulated ? "simulation" : "razorpay",
      orderId: order.id,
      ...(!simulated ? { keyId: process.env.RAZORPAY_KEY_ID } : {}),
      template: cfg,
    });
  } catch (e) {
    next(e);
  }
});
r.post("/verify", async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_KEY_ID)
      return res
        .status(503)
        .json({ message: "Payments are currently unavailable." });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    )
      return res
        .status(400)
        .json({ message: "Invalid payment verification details." });
    const purchase = await TemplatePurchase.findOne({
      ownerId: req.user._id,
      orderId: razorpay_order_id,
      provider: "razorpay",
    });
    if (!purchase)
      return res.status(404).json({ message: "Template order not found." });
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    const a = Buffer.from(expected),
      b = Buffer.from(razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
      return res.status(400).json({ message: "Payment verification failed." });
    const payment = await razorpay().payments.fetch(razorpay_payment_id);
    if (!matchesCapturedTemplatePayment(payment, purchase))
      return res.status(409).json({
        message:
          "Payment is not confirmed yet. If you were charged, the template will unlock when confirmation arrives. Please refresh shortly.",
      });
    const paid = await completeTemplatePurchase(purchase, razorpay_payment_id);
    res.json({ purchase: paid, unlocked: paid?.status === "paid" });
  } catch (e) {
    next(e);
  }
});
r.post("/simulate-success", async (req, res, next) => {
  try {
    if (!simulationEnabled())
      return res.status(404).json({ message: "Not found." });
    if (typeof req.body?.orderId !== "string")
      return res.status(400).json({ message: "Invalid template order." });
    const purchase = await TemplatePurchase.findOne({
      ownerId: req.user._id,
      orderId: req.body.orderId,
      provider: "simulation",
    });
    if (!purchase)
      return res
        .status(404)
        .json({ message: "Simulated template order not found." });
    const paid = await completeTemplatePurchase(
      purchase,
      "tpl_sim_pay_" + crypto.randomUUID(),
    );
    res.json({
      purchase: paid,
      unlocked: paid?.status === "paid",
      simulated: true,
    });
  } catch (e) {
    next(e);
  }
});
export default r;
