import React, { useEffect, useState } from "react";
import api from "../api.js";
export function AnalyticsPanel() {
  const [a, A] = useState(null);
  useEffect(() => {
    api
      .get("/portfolio/analytics")
      .then((r) => A(r.data))
      .catch(() => A({ totalViews: 0, days: [] }));
  }, []);
  return (
    <>
      <small className="eyebrow">YOUR PORTFOLIO ANALYTICS</small>
      <h1>
        People are finding <i>you.</i>
      </h1>
      <p>
        Daily page views recorded on your published personal brand page. No
        visitor identities are collected.
      </p>
      <section className="panel">
        <small className="eyebrow">TOTAL PAGE VIEWS</small>
        <h2>{a?.totalViews ?? "…"}</h2>
        <p>Page views count page loads. They are not unique visitors.</p>
      </section>
      <section className="panel">
        <h3>Last 30 days</h3>
        {!a?.days?.length ? (
          <p>
            Views will appear after your personal brand is published and
            visited.
          </p>
        ) : (
          a.days.map((d) => (
            <div className="view-day" key={d.day}>
              <span>{d.day}</span>
              <div>
                <i
                  style={{
                    width: `${Math.max(3, Math.min(100, d.views * 8))}%`,
                  }}
                />
              </div>
              <b>{d.views}</b>
            </div>
          ))
        )}
      </section>
    </>
  );
}
export function BillingHistory() {
  const [d, D] = useState([]);
  useEffect(() => {
    api
      .get("/billing/history")
      .then((r) => D(r.data.payments))
      .catch(() => {});
  }, []);
  return (
    <>
      <small className="eyebrow">ACCOUNT</small>
      <h1>
        Billing <i>history.</i>
      </h1>
      <section className="panel">
        {d.length ? (
          d.map((x) => (
            <div className="billing-row" key={x._id}>
              <b>
                {x.amount} {x.currency}
              </b>
              <span>
                {x.status} · {new Date(x.createdAt).toLocaleDateString()}
              </span>
              <small>
                {x.kind === "template"
                  ? x.planName + " · one-time template"
                  : x.planName || "Publishing subscription"}
              </small>
              <small>
                {x.provider === "simulation"
                  ? "Development simulation"
                  : "Razorpay"}
              </small>
            </div>
          ))
        ) : (
          <p>No payments recorded yet.</p>
        )}
      </section>
    </>
  );
}
