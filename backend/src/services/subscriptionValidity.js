import Subscription from "../models/Subscription.js";
import SubscriptionTerm from "../models/SubscriptionTerm.js";
export const DAY_MS = 86400000;
export function extensionExpiry(previousExpiry, periodDays, now = new Date()) {
  const previous = new Date(previousExpiry || 0).getTime();
  return new Date(
    Math.max(Number.isFinite(previous) ? previous : 0, now.getTime()) +
      periodDays * DAY_MS,
  );
}
export function renewalAvailable(subscription, now = new Date()) {
  return (
    ["active", "expired"].includes(subscription?.status) &&
    Number.isFinite(new Date(subscription.endsAt).getTime()) &&
    new Date(subscription.endsAt).getTime() - now.getTime() < 30 * DAY_MS
  );
}
export async function getCurrentSubscription(ownerId, now = new Date()) {
  const active = await Subscription.findOne({
    ownerId,
    status: "active",
    endsAt: { $gt: now },
  }).sort({ endsAt: -1, createdAt: -1 });
  if (active) return active;
  const paid = await Subscription.findOne({
    ownerId,
    status: { $in: ["active", "expired"] },
    endsAt: { $exists: true },
  }).sort({ endsAt: -1, createdAt: -1 });
  if (paid) {
    if (paid.status === "active") {
      paid.status = "expired";
      await paid.save();
    }
    return paid;
  }
  return Subscription.findOne({ ownerId }).sort({ createdAt: -1 });
}
export function matchesCapturedSubscriptionPayment(payment, sub) {
  return Boolean(
    payment?.id &&
    payment.order_id === sub.orderId &&
    payment.status === "captured" &&
    payment.amount === Math.round(sub.amount * 100) &&
    payment.currency === sub.currency,
  );
}
export async function activateSubscription(sub, paymentId, now = new Date()) {
  // Historical paid/expired orders must never add their duration a second time.
  if (sub.status !== "pending") return sub;
  if (
    !sub.orderId ||
    !Number.isInteger(sub.periodDays) ||
    sub.periodDays <= 0 ||
    sub.periodDays > 36600
  )
    throw new Error("Invalid subscription duration.");
  const previous = await Subscription.findOne({
    ownerId: sub.ownerId,
    status: "active",
    endsAt: { $gt: now },
  }).sort({ endsAt: -1 });
  const previousExpiry = extensionExpiry(previous?.endsAt, 0, now);
  try {
    await SubscriptionTerm.updateOne(
      { ownerId: sub.ownerId },
      {
        $setOnInsert: {
          ownerId: sub.ownerId,
          endsAt: previousExpiry,
          appliedOrderIds: [],
        },
      },
      { upsert: true },
    );
  } catch (e) {
    if (e.code !== 11000) throw e;
  }
  const term =
    (await SubscriptionTerm.findOneAndUpdate(
      { ownerId: sub.ownerId, appliedOrderIds: { $ne: sub.orderId } },
      [
        {
          $set: {
            endsAt: {
              $add: [
                { $max: [{ $ifNull: ["$endsAt", now] }, previousExpiry, now] },
                sub.periodDays * DAY_MS,
              ],
            },
            appliedOrderIds: {
              $concatArrays: [
                { $ifNull: ["$appliedOrderIds", []] },
                [sub.orderId],
              ],
            },
          },
        },
      ],
      { new: true },
    )) || (await SubscriptionTerm.findOne({ ownerId: sub.ownerId }));
  if (!term)
    throw new Error(
      "Could not apply subscription validity. Please retry verification.",
    );
  const activated = await Subscription.findOneAndUpdate(
    { _id: sub._id, status: "pending" },
    {
      $set: {
        status: "active",
        startsAt: now,
        endsAt: term.endsAt,
        paymentId,
        validityAppliedAt: now,
      },
    },
    { new: true, runValidators: true },
  );
  return activated || Subscription.findById(sub._id);
}
