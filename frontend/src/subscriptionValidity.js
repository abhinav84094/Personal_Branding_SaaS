export const DAY_MS = 86400000;
export function subscriptionValidity(subscription, now = Date.now()) {
  const expiry = new Date(subscription?.endsAt || 0).getTime();
  const hasTerm =
    ["active", "expired"].includes(subscription?.status) &&
    Number.isFinite(expiry) &&
    expiry > 0;
  const remaining = hasTerm ? Math.max(0, expiry - now) : 0;
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hasTerm,
    active: hasTerm && subscription.status === "active" && remaining > 0,
    expired: hasTerm && remaining <= 0,
    remainingMs: remaining,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    canRenew: hasTerm && remaining < 30 * DAY_MS,
    expiry,
  };
}
export function projectedExpiry(subscription, periodDays, now = Date.now()) {
  const validity = subscriptionValidity(subscription, now);
  return new Date(
    Math.max(validity.hasTerm ? validity.expiry : 0, now) + periodDays * DAY_MS,
  );
}
