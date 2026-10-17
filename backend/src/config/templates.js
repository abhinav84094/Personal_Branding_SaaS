export const TEMPLATE_IDS = [
  "minimal",
  "developer",
  "creative",
  "student",
  "professional",
  "services",
  "modern",
  "aurora",
  "kinetic",
  "opal",
  "noir",
  "terra",
];
const premiumNames = {
  opal: "Opal Glass",
  noir: "Noir Atelier",
  terra: "Terra Bloom",
  aurora: "Aurora Motion",
  kinetic: "Kinetic Studio",
};
export function getAnimatedTemplatePrice() {
  const raw = String(process.env.animatedTemplatePrice || "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw),
    minor = Math.round(amount * 100);
  return Number.isSafeInteger(minor) && minor >= 100 ? amount : null;
}
export function getTemplateConfig(id) {
  if (!TEMPLATE_IDS.includes(id)) return null;
  return {
    id,
    name: premiumNames[id] || id,
    premium: Boolean(premiumNames[id]),
    amount: premiumNames[id] ? getAnimatedTemplatePrice() : 0,
    purchasable: !premiumNames[id] || getAnimatedTemplatePrice() !== null,
    currency: "INR",
    billing: "one-time",
  };
}
export function getTemplateCatalog() {
  return TEMPLATE_IDS.map(getTemplateConfig);
}
