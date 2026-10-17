import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock3, ArrowUpRight } from "lucide-react";
import PricingPlans from "./PricingPlans.jsx";
import SupportContacts from "./SupportContacts.jsx";
import {
  subscriptionValidity,
  projectedExpiry,
} from "../subscriptionValidity.js";
const dateLabel = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
export default function SubscriptionPanel({
  subscription,
  serverTime,
  plans = [],
  selectedPlanId,
  onSelect,
  onPay,
  busy = false,
  publicUrl,
  supportContacts,
  published,
}) {
  const [clock, setClock] = useState(Date.now()),
    [showPlans, setShowPlans] = useState(false);
  const offset = useMemo(() => {
    const parsed = Date.parse(serverTime);
    return Number.isFinite(parsed) ? parsed - Date.now() : 0;
  }, [serverTime]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () => setShowPlans(false),
    [subscription?._id, subscription?.endsAt],
  );
  const now = clock + offset,
    validity = subscriptionValidity(subscription, now);
  const selected = plans.find((plan) => plan.id === selectedPlanId);
  const canPurchase =
    selected && Number.isFinite(selected.amount) && selected.amount > 0;
  return (
    <>
      <small className="eyebrow">YOUR SUBSCRIPTION</small>
      <h1>
        {validity.active ? (
          <>
            Your plan. <i>Your time.</i>
          </>
        ) : (
          <>
            Your next <i>chapter.</i>
          </>
        )}
      </h1>
      <p>
        Keep your personal brand online. Every renewal adds time to your
        validity.
      </p>
      <section
        className={
          "panel subscription-status " + (validity.canRenew ? "expiring" : "")
        }
      >
        <div className="subscription-status-heading">
          <span className="subscription-icon">
            <CalendarClock size={24} />
          </span>
          <div>
            <small>PUBLISHING PLAN</small>
            <h2>
              {subscription?.planName ||
                subscription?.planId ||
                "No active plan"}
            </h2>
          </div>
          <span
            className={
              "subscription-state " + (validity.active ? "active" : "")
            }
          >
            {validity.active
              ? "Active"
              : validity.expired
                ? "Expired"
                : subscription?.status === "pending"
                  ? "Payment pending"
                  : "Not active"}
          </span>
        </div>
        {validity.hasTerm && (
          <>
            <div
              className="validity-countdown"
              aria-label="Subscription validity countdown"
            >
              <p>
                <Clock3 size={16} />
                {validity.active ? "Time remaining" : "Your plan has expired"}
              </p>
              <div className="countdown-units countdown-days-only">
                <div>
                  <strong>{validity.days}</strong>
                  <span>{validity.days === 1 ? "Day" : "Days"}</span>
                </div>
              </div>
            </div>
            <p className="subscription-expiry">
              Valid through <strong>{dateLabel(subscription.endsAt)}</strong>
            </p>
          </>
        )}
        {validity.active && !validity.canRenew && (
          <p className="renewal-hint">
            You can upgrade validity when fewer than 30 days remain.
          </p>
        )}
        {validity.canRenew && (
          <div className="renewal-callout">
            <div>
              <strong>
                {validity.expired
                  ? "Ready to get back online?"
                  : "Your validity is running low."}
              </strong>
              <p>
                {validity.active
                  ? "Renew now without losing your remaining days."
                  : "Renew to restart your validity from today."}
              </p>
            </div>
            <button
              type="button"
              className="btn dark"
              onClick={() => setShowPlans(!showPlans)}
              aria-expanded={showPlans}
            >
              {showPlans ? "Hide plans" : "Upgrade validity"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
        {validity.active && published && publicUrl && (
          <>
            <a
              className="published-site-link"
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open your published website <ArrowUpRight size={15} />
            </a>
            <SupportContacts contacts={supportContacts} />
          </>
        )}
      </section>
      {(!validity.hasTerm || showPlans) && (
        <section className="subscription-renewal-plans">
          <div>
            <small className="eyebrow">
              {validity.hasTerm
                ? "EXTEND YOUR VALIDITY"
                : "CHOOSE YOUR ACCESS PERIOD"}
            </small>
            <h2>
              {validity.hasTerm ? "Keep your momentum." : "Choose your plan."}
            </h2>
            <p>
              {validity.active
                ? "Your selected duration will be added to your current expiry date."
                : "Your selected duration starts when payment is verified."}
            </p>
          </div>
          <PricingPlans
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelect={onSelect}
          />
          {canPurchase && (
            <p className="renewal-projection">
              After payment:{" "}
              <strong>
                {dateLabel(
                  projectedExpiry(subscription, selected.periodDays, now),
                )}
              </strong>
            </p>
          )}
          <button
            className="btn dark"
            disabled={busy || !canPurchase}
            onClick={() => onPay(selectedPlanId, validity.hasTerm)}
          >
            {busy
              ? "Opening secure checkout…"
              : validity.hasTerm
                ? "Add " + (selected?.periodDays || "") + " days →"
                : "Activate selected plan →"}
          </button>
        </section>
      )}
    </>
  );
}
