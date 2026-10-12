const currency = () => process.env.PLAN_CURRENCY || "INR";

function amountFromEnv(key, fallback = "0") {
  return Number(process.env[key] ?? fallback);
}

export function getPlans() {
  return [
    {
      id: "three-months",
      name: "3 Months",
      durationLabel: "90 days",
      periodDays: 90,
      amount: amountFromEnv("PLAN_3_MONTHS_AMOUNT"),
      priceEnvKey: "PLAN_3_MONTHS_AMOUNT",
      currency: currency(),
    },
    {
      id: "one-year",
      name: "1 Year",
      durationLabel: "365 days",
      periodDays: 365,
      amount: amountFromEnv(
        "PLAN_1_YEAR_AMOUNT",
        process.env.PLAN_AMOUNT ?? "0",
      ),
      priceEnvKey: "PLAN_1_YEAR_AMOUNT",
      currency: currency(),
    },
  ];
}

export function getPlanById(id) {
  return getPlans().find((plan) => plan.id === id) || null;
}
