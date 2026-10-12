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
  const sub = await Subscription.findOne({
    orderId: payment.order_id,
    provider: "razorpay",
  });
  if (sub && !sub.processedEvents.includes(event.id || payment.id)) {
    sub.processedEvents.push(event.id || payment.id);
    if (sub.status !== "active") {
      sub.status = "active";
      sub.startsAt = new Date();
      sub.endsAt = new Date(Date.now() + sub.periodDays * 86400000);
      sub.paymentId = payment.id;
    }
    await sub.save();
  }
  if (sub?.status === "active") {
    await publishPortfolioAfterPayment(sub.ownerId);
  }
  res.json({ received: true });
}
