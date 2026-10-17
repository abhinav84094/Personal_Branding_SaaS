export function formatTemplatePrice(config) {
  if (
    !Number.isFinite(config?.amount) ||
    config.amount <= 0 ||
    config.purchasable === false
  )
    return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: config.currency || "INR",
    maximumFractionDigits: 2,
  }).format(config.amount);
}
