import {
  activateSubscription,
  matchesCapturedSubscriptionPayment,
} from "./subscriptionValidity.js";
import TemplatePurchase from "../models/TemplatePurchase.js";
import {
  matchesCapturedTemplatePayment,
  completeTemplatePurchase,
} from "./templateAccess.js";
import crypto from "node:crypto";
import Subscription from "../models/Subscription.js";
import { publishPortfolioAfterPayment } from "./publishing.js";
export async function webhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret)
    return res.status(503).json({ message: "Webhook is not configured." });
  const signature = req.get("x-razorpay-signature") || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");
  const a = Buffer.from(expected),
    b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return res.status(400).json({ message: "Invalid webhook signature." });
  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Invalid webhook body." });
  }
  if (event.event !== "payment.captured")
    return res.json({ received: true, ignored: true });
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment?.id)
    return res.status(400).json({ message: "Invalid payment event." });
  const purchase = await TemplatePurchase.findOne({
    orderId: payment.order_id,
    provider: "razorpay",
  });
  if (purchase) {
    if (!matchesCapturedTemplatePayment(payment, purchase))
      return res.status(400).json({
        message: "Template payment amount, currency or status does not match.",
      });
    await completeTemplatePurchase(purchase, payment.id);
    return res.json({ received: true, templateUnlocked: true });
  }
  const sub = await Subscription.findOne({
    orderId: payment.order_id,
    provider: "razorpay",
  });
  let activated = sub;
  if (sub) {
    if (!matchesCapturedSubscriptionPayment(payment, sub))
      return res
        .status(400)
        .json({
          message:
            "Subscription payment amount, currency or status does not match.",
        });
    activated = await activateSubscription(sub, payment.id);
  }
  if (activated?.status === "active") {
    await publishPortfolioAfterPayment(sub.ownerId);
  }
  res.json({ received: true });
}
