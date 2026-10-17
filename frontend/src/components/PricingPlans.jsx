import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const features = [
  "Your own personal brand URL",
  "All standard responsive templates",
  "Edit your personal brand anytime",
  "Privacy-first view analytics",
];

export function formatPlanPrice(plan) {
  if (!plan || !Number.isFinite(plan.amount) || plan.amount <= 0) {
    return "Set price in backend/.env";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: plan.currency || "INR",
    maximumFractionDigits: 0,
  }).format(plan.amount);
}

export default function PricingPlans({
  plans = [],
  selectedPlanId,
  onSelect,
  publicMode = false,
}) {
  if (!plans.length) {
    return <p className="pricing-empty">Pricing plans are loading.</p>;
  }

  return (
    <div className={`pricing-plans ${publicMode ? "public-pricing" : ""}`}>
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const priceIsSet = Number.isFinite(plan.amount) && plan.amount > 0;

        return (
          <article
            key={plan.id}
            className={`price-card pricing-plan-card ${isSelected ? "selected" : ""} ${!priceIsSet ? "price-not-set" : ""}`}
          >
            <small className="plan-duration">{plan.durationLabel}</small>
            <h3>{formatPlanPrice(plan)}</h3>
            {!priceIsSet && (
              <small className="price-env-hint">
                Set {plan.priceEnvKey || "this plan amount"} in backend/.env
              </small>
            )}
            <p>{plan.name} access for your personal brand.</p>
            <ul className="plan-features">
              {features.map((feature) => (
                <li key={feature}>
                  <Check size={16} /> {feature}
                </li>
              ))}
            </ul>
            <p className="premium-plan-note">
              Animated templates are sold separately as one-time purchases. See
              the template gallery for current prices.
            </p>
            {publicMode ? (
              <Link className="btn dark" to="/login">
                Build your personal brand →
              </Link>
            ) : (
              <button
                type="button"
                className={isSelected ? "btn dark" : "btn light"}
                onClick={() => onSelect?.(plan.id)}
                disabled={!priceIsSet}
              >
                {!priceIsSet
                  ? "Price not set"
                  : isSelected
                    ? "Selected"
                    : "Choose this plan"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
