import TemplatePurchase from "../models/TemplatePurchase.js";
import { getTemplateConfig, getTemplateCatalog } from "../config/templates.js";
export async function hasTemplateAccess(ownerId, templateId) {
  const cfg = getTemplateConfig(templateId);
  if (!cfg) return false;
  if (!cfg.premium) return true;
  return Boolean(
    await TemplatePurchase.exists({
      ownerId,
      templateId,
      status: "paid",
      ...(process.env.NODE_ENV === "production"
        ? { provider: "razorpay" }
        : {}),
    }),
  );
}
export async function getTemplateAccessCatalog(ownerId) {
  const purchases = await TemplatePurchase.find({
    ownerId,
    status: "paid",
    ...(process.env.NODE_ENV === "production" ? { provider: "razorpay" } : {}),
  })
    .select("templateId")
    .lean();
  const owned = new Set(purchases.map((p) => p.templateId));
  return getTemplateCatalog().map((t) => ({
    ...t,
    unlocked: !t.premium || owned.has(t.id),
  }));
}
export function matchesCapturedTemplatePayment(payment, purchase) {
  return Boolean(
    payment &&
    payment.id &&
    payment.order_id === purchase.orderId &&
    payment.status === "captured" &&
    payment.amount === Math.round(purchase.amount * 100) &&
    payment.currency === purchase.currency,
  );
}
export async function completeTemplatePurchase(purchase, paymentId) {
  if (purchase.status === "paid") return purchase;
  return (
    (await TemplatePurchase.findOneAndUpdate(
      { _id: purchase._id, status: "pending" },
      { $set: { status: "paid", paymentId, paidAt: new Date() } },
      { new: true },
    )) || (await TemplatePurchase.findById(purchase._id))
  );
}
export const templatePaymentRequired = {
  message: "Purchase this animated template before selecting or publishing it.",
  code: "TEMPLATE_PAYMENT_REQUIRED",
};
