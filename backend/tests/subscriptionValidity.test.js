import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import crypto from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";
import Subscription from "../src/models/Subscription.js";
import SubscriptionTerm from "../src/models/SubscriptionTerm.js";
import User from "../src/models/User.js";
import Portfolio from "../src/models/Portfolio.js";
import TemplatePurchase from "../src/models/TemplatePurchase.js";
import billing from "../src/routes/billing.js";
import { signSession } from "../src/middleware/auth.js";
import {
  activateSubscription,
  getCurrentSubscription,
  renewalAvailable,
  extensionExpiry,
  matchesCapturedSubscriptionPayment,
  DAY_MS,
} from "../src/services/subscriptionValidity.js";
import { webhook } from "../src/services/webhook.js";
const NOW = new Date("2026-10-17T12:00:00.000Z");
const user = {
  _id: "507f1f77bcf86cd799439011",
  id: "507f1f77bcf86cd799439011",
  tokenVersion: 0,
};
let rows = [],
  terms = new Map(),
  server,
  base,
  cookie;
const env = {};
const matches = (row, q) =>
  Object.entries(q).every(([k, v]) =>
    v && typeof v === "object" && !(v instanceof Date)
      ? Object.entries(v).every(([op, val]) =>
          op === "$gt"
            ? row[k] > val
            : op === "$in"
              ? val.includes(row[k])
              : op === "$exists"
                ? (row[k] !== undefined) === val
                : op === "$ne"
                  ? row[k] !== val
                  : false,
        )
      : String(row[k]) === String(v),
  );
function add(data) {
  const row = {
    _id: String(rows.length + 1),
    createdAt: new Date(),
    ...data,
    save: async () => row,
  };
  rows.push(row);
  return row;
}
function query(q) {
  const find = (sort) =>
    rows
      .filter((row) => matches(row, q))
      .sort((a, b) => {
        for (const [k, dir] of Object.entries(sort || {})) {
          const diff =
            (a[k] instanceof Date ? a[k].getTime() : a[k] || 0) -
            (b[k] instanceof Date ? b[k].getTime() : b[k] || 0);
          if (diff) return diff * dir;
        }
        return 0;
      })[0] || null;
  return {
    then: (yes, no) => Promise.resolve(find()).then(yes, no),
    sort: async (sort) => find(sort),
  };
}
function expression(expr, doc) {
  if (expr instanceof Date) return expr;
  if (typeof expr === "string" && expr.startsWith("$"))
    return doc[expr.slice(1)];
  if (Array.isArray(expr)) return expr.map((x) => expression(x, doc));
  if (!expr || typeof expr !== "object") return expr;
  if (expr.$ifNull) {
    const [a, b] = expression(expr.$ifNull, doc);
    return a ?? b;
  }
  if (expr.$max)
    return expression(expr.$max, doc).reduce((a, b) => (a > b ? a : b));
  if (expr.$add) {
    const values = expression(expr.$add, doc),
      total = values.reduce(
        (a, b) => a + (b instanceof Date ? b.getTime() : b),
        0,
      );
    return values.some((v) => v instanceof Date) ? new Date(total) : total;
  }
  if (expr.$concatArrays) return expression(expr.$concatArrays, doc).flat();
  throw Error("Unknown pipeline expression");
}
before(async () => {
  for (const key of [
    "JWT_SECRET",
    "NODE_ENV",
    "PAYMENT_SIMULATION_ENABLED",
    "PLAN_3_MONTHS_AMOUNT",
    "PLAN_1_YEAR_AMOUNT",
    "RAZORPAY_WEBHOOK_SECRET",
  ])
    env[key] = process.env[key];
  Object.assign(process.env, {
    JWT_SECRET: "validity-test-session",
    NODE_ENV: "test",
    PAYMENT_SIMULATION_ENABLED: "true",
    PLAN_3_MONTHS_AMOUNT: "99",
    PLAN_1_YEAR_AMOUNT: "299",
    RAZORPAY_WEBHOOK_SECRET: "validity-webhook",
  });
  test.mock.method(User, "findById", () => ({ select: async () => user }));
  test.mock.method(Portfolio, "findOne", async () => ({
    profile: { fullName: "Test", contactNumber: "9000000000" },
    username: "test-user",
    templateId: "minimal",
    status: "published",
  }));
  test.mock.method(TemplatePurchase, "findOne", async () => null);
  test.mock.method(Subscription, "findOne", (q) => query(q));
  test.mock.method(Subscription, "create", async (data) => add(data));
  test.mock.method(Subscription, "findById", async (id) =>
    rows.find((r) => r._id === id),
  );
  test.mock.method(Subscription, "findOneAndUpdate", async (q, u) => {
    const row = rows.find((r) => matches(r, q));
    if (!row) return null;
    Object.assign(row, u.$set);
    return { ...row };
  });
  test.mock.method(
    Subscription,
    "exists",
    async (q) => rows.find((r) => matches(r, q)) || null,
  );
  test.mock.method(SubscriptionTerm, "updateOne", async (q, u) => {
    if (!terms.has(String(q.ownerId)))
      terms.set(String(q.ownerId), { ...u.$setOnInsert });
  });
  test.mock.method(
    SubscriptionTerm,
    "findOneAndUpdate",
    async (q, pipeline) => {
      const term = terms.get(String(q.ownerId));
      if (!term || term.appliedOrderIds.includes(q.appliedOrderIds.$ne))
        return null;
      const next = {};
      for (const [k, expr] of Object.entries(pipeline[0].$set))
        next[k] = expression(expr, term);
      Object.assign(term, next);
      return { ...term };
    },
  );
  test.mock.method(
    SubscriptionTerm,
    "findOne",
    async (q) => terms.get(String(q.ownerId)) || null,
  );
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/billing", billing);
  app.use((e, _req, res, _next) =>
    res.status(500).json({ message: e.message }),
  );
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
  cookie = "accessToken=" + signSession(user);
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});
async function post(path, body) {
  const res = await fetch(base + "/billing" + path, {
    method: "POST",
    headers: { cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}
test("renewal threshold is strictly under 30 days and expired plans restart from now", () => {
  assert.equal(
    renewalAvailable(
      { status: "active", endsAt: new Date(+NOW + 30 * DAY_MS) },
      NOW,
    ),
    false,
  );
  assert.equal(
    renewalAvailable(
      { status: "active", endsAt: new Date(+NOW + 30 * DAY_MS - 1) },
      NOW,
    ),
    true,
  );
  assert.equal(
    renewalAvailable(
      { status: "expired", endsAt: new Date(+NOW - DAY_MS) },
      NOW,
    ),
    true,
  );
  assert.equal(
    +extensionExpiry(new Date(+NOW - DAY_MS), 90, NOW),
    +NOW + 90 * DAY_MS,
  );
});
test("renewal checkout adds 90 days to the existing expiry and replay does not add more days", async () => {
  const expiry = new Date(Date.now() + 20 * DAY_MS);
  add({
    ownerId: user._id,
    status: "active",
    endsAt: expiry,
    provider: "simulation",
    orderId: "legacy",
    paymentId: "paid",
    periodDays: 90,
    planId: "three-months",
    planName: "3 Months",
  });
  const order = await post("/order", { planId: "three-months", renew: true });
  assert.equal(order.status, 200);
  assert.equal(
    rows.find((r) => r.orderId === order.data.orderId).renewal,
    true,
  );
  const paid = await post("/simulate-success", { orderId: order.data.orderId });
  assert.equal(paid.status, 200);
  assert.equal(+new Date(paid.data.subscription.endsAt), +expiry + 90 * DAY_MS);
  const repeated = await post("/simulate-success", {
    orderId: order.data.orderId,
  });
  assert.equal(
    +new Date(repeated.data.subscription.endsAt),
    +expiry + 90 * DAY_MS,
  );
  assert.equal(
    (await post("/order", { planId: "one-year", renew: true })).status,
    400,
  );
});
test("pending checkouts cannot hide a valid subscription", async () => {
  const current = await getCurrentSubscription(user._id);
  add({
    ownerId: user._id,
    status: "pending",
    createdAt: new Date(Date.now() + 1000),
    orderId: "unpaid-latest",
  });
  assert.equal((await getCurrentSubscription(user._id))._id, current._id);
});
test("new and expired accounts start from the payment time", async () => {
  add({
    ownerId: "expired-owner",
    status: "expired",
    endsAt: new Date(+NOW - 10 * DAY_MS),
    orderId: "expired-legacy",
  });
  const pending = add({
    ownerId: "expired-owner",
    status: "pending",
    orderId: "expired-new",
    periodDays: 365,
  });
  const activated = await activateSubscription(
    { ...pending },
    "expired-pay",
    NOW,
  );
  assert.equal(+activated.endsAt, +NOW + 365 * DAY_MS);
  const first = add({
    ownerId: "new-owner",
    status: "pending",
    orderId: "first-new",
    periodDays: 90,
  });
  assert.equal(
    +(await activateSubscription({ ...first }, "first-pay", NOW)).endsAt,
    +NOW + 90 * DAY_MS,
  );
});
test("concurrent distinct renewals accumulate and the same order is applied once", async () => {
  const ownerId = "concurrent-owner",
    expiry = new Date(+NOW + 20 * DAY_MS);
  add({ ownerId, status: "active", endsAt: expiry, orderId: "concurrent-old" });
  const a = add({
      ownerId,
      status: "pending",
      orderId: "concurrent-a",
      periodDays: 90,
    }),
    b = add({
      ownerId,
      status: "pending",
      orderId: "concurrent-b",
      periodDays: 365,
    });
  const staleA = { ...a };
  await Promise.all([
    activateSubscription({ ...a }, "pay-a", NOW),
    activateSubscription({ ...b }, "pay-b", NOW),
  ]);
  assert.equal(+terms.get(ownerId).endsAt, +expiry + 455 * DAY_MS);
  await activateSubscription(staleA, "pay-a", NOW);
  assert.equal(+terms.get(ownerId).endsAt, +expiry + 455 * DAY_MS);
  assert.equal(terms.get(ownerId).appliedOrderIds.length, 2);
  const legacy = {
    ownerId: "legacy-owner",
    status: "expired",
    endsAt: new Date(+NOW - DAY_MS),
    orderId: "legacy-paid",
    periodDays: 90,
    paymentId: "legacy-payment",
  };
  await activateSubscription(legacy, "legacy-payment", NOW);
  assert.equal(terms.has("legacy-owner"), false);
});
test("webhook renewal and repeated captured events preserve accumulated validity", async () => {
  const ownerId = "webhook-owner",
    expiry = new Date(Date.now() + 12 * DAY_MS);
  add({ ownerId, status: "active", endsAt: expiry, orderId: "webhook-legacy" });
  const sub = add({
    ownerId,
    status: "pending",
    provider: "razorpay",
    orderId: "webhook-renew",
    periodDays: 90,
    amount: 99,
    currency: "INR",
  });
  const event = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay-renew",
          order_id: sub.orderId,
          status: "captured",
          amount: 9900,
          currency: "INR",
        },
      },
    },
  };
  const body = Buffer.from(JSON.stringify(event)),
    signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
  const res = {
    json() {
      return this;
    },
    status() {
      return this;
    },
  };
  await webhook({ body, get: () => signature }, res);
  const end = +(await getCurrentSubscription(ownerId)).endsAt;
  assert.equal(end, +expiry + 90 * DAY_MS);
  await webhook({ body, get: () => signature }, res);
  assert.equal(+(await getCurrentSubscription(ownerId)).endsAt, end);
});
test("subscription payment capture requires the recorded order, amount and currency", () => {
  const sub = { orderId: "bound-order", amount: 99, currency: "INR" },
    payment = {
      id: "bound-pay",
      order_id: "bound-order",
      amount: 9900,
      currency: "INR",
      status: "captured",
    };
  assert.equal(matchesCapturedSubscriptionPayment(payment, sub), true);
  for (const bad of [
    { amount: 1 },
    { currency: "USD" },
    { order_id: "other-order" },
    { status: "authorized" },
  ])
    assert.equal(
      matchesCapturedSubscriptionPayment({ ...payment, ...bad }, sub),
      false,
    );
});
