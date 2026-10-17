import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";
import portfolioRouter from "../src/routes/portfolio.js";
import billingRouter from "../src/routes/billing.js";
import Portfolio from "../src/models/Portfolio.js";
import Subscription from "../src/models/Subscription.js";
import User from "../src/models/User.js";
import TemplatePurchase from "../src/models/TemplatePurchase.js";
import { signSession } from "../src/middleware/auth.js";
import {
  hasTemplateAccess,
  matchesCapturedTemplatePayment,
} from "../src/services/templateAccess.js";
import { getTemplateConfig, TEMPLATE_IDS } from "../src/config/templates.js";
import { isPortfolioReadyToPublish } from "../src/services/publishing.js";
import { webhook } from "../src/services/webhook.js";
const user = { _id: "507f1f77bcf86cd799439011", tokenVersion: 0 };
const other = "507f1f77bcf86cd799439012";
let server,
  base,
  cookie,
  writes = 0,
  purchases = [];
const portfolio = {
  ownerId: user._id,
  profile: { fullName: "Test", contactNumber: "9000000000" },
  username: "test-user",
  templateId: "minimal",
  status: "draft",
};
const oldEnv = {};
before(async () => {
  for (const key of [
    "animatedTemplatePrice",
    "JWT_SECRET",
    "NODE_ENV",
    "PAYMENT_SIMULATION_ENABLED",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ])
    oldEnv[key] = process.env[key];
  Object.assign(process.env, {
    animatedTemplatePrice: "5",
    JWT_SECRET: "test-only-template-session",
    NODE_ENV: "test",
    PAYMENT_SIMULATION_ENABLED: "true",
    RAZORPAY_KEY_ID: "test-key",
    RAZORPAY_KEY_SECRET: "test-secret",
    RAZORPAY_WEBHOOK_SECRET: "test-webhook",
  });
  const matches = (p, q) => Object.entries(q).every(([k, v]) => p[k] === v);
  test.mock.method(User, "findById", () => ({ select: async () => user }));
  test.mock.method(Portfolio, "findOne", async () => ({ ...portfolio }));
  test.mock.method(Portfolio, "findOneAndUpdate", async (_q, update) => {
    writes++;
    return { ...portfolio, ...update.$set };
  });
  test.mock.method(Subscription, "findOne", async () => ({
    status: "active",
    endsAt: new Date(Date.now() + 86400000),
  }));
  test.mock.method(Subscription, "find", () => ({
    sort: () => ({ select: () => ({ lean: async () => [] }) }),
  }));
  test.mock.method(
    TemplatePurchase,
    "exists",
    async (q) => purchases.find((p) => matches(p, q)) || null,
  );
  test.mock.method(
    TemplatePurchase,
    "findOne",
    async (q) => purchases.find((p) => matches(p, q)) || null,
  );
  test.mock.method(TemplatePurchase, "find", (q) => ({
    select: () => ({
      lean: async () => purchases.filter((p) => matches(p, q)),
    }),
    sort: () => ({
      select: () => ({
        lean: async () => purchases.filter((p) => matches(p, q)),
      }),
    }),
  }));
  test.mock.method(TemplatePurchase, "create", async (data) => {
    const p = {
      ...data,
      _id: String(purchases.length + 1),
      status: "pending",
      createdAt: new Date(),
    };
    purchases.push(p);
    return p;
  });
  test.mock.method(TemplatePurchase, "findOneAndUpdate", async (q, u) => {
    const p = purchases.find((p) => matches(p, q));
    if (!p) return null;
    Object.assign(p, u.$set);
    return p;
  });
  test.mock.method(TemplatePurchase, "findById", async (id) =>
    purchases.find((p) => p._id === id),
  );
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/portfolio", portfolioRouter);
  app.use("/billing", billingRouter);
  app.use((e, _req, res, _next) =>
    res.status(500).json({ message: e.message }),
  );
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
  cookie = "accessToken=" + signSession(user);
});
after(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((resolve) => server.close(resolve));
  for (const [key, value] of Object.entries(oldEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
async function request(path, method = "GET", body) {
  const res = await fetch(base + path, {
    method,
    headers: { cookie, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, data: await res.json() };
}
test("animated templates use the configured price; legacy designs remain supported", () => {
  for (const id of ["aurora", "kinetic", "opal", "noir", "terra"])
    assert.deepEqual(
      { ...getTemplateConfig(id), name: undefined },
      {
        id,
        name: undefined,
        premium: true,
        amount: 5,
        purchasable: true,
        currency: "INR",
        billing: "one-time",
      },
    );
  for (const id of TEMPLATE_IDS)
    assert.ok(isPortfolioReadyToPublish({ ...portfolio, templateId: id }));
});
test("unpaid and pending purchases cannot bypass selection, profile PATCH or publishing", async () => {
  for (const id of ["aurora", "kinetic", "opal", "noir", "terra"]) {
    assert.equal(
      (await request("/portfolio/template", "PUT", { templateId: id })).status,
      402,
    );
    assert.equal(
      (await request("/portfolio/me", "PATCH", { templateId: id })).status,
      402,
    );
    portfolio.templateId = id;
    assert.equal((await request("/portfolio/publish", "POST", {})).status, 402);
  }
  assert.equal(writes, 0);
  portfolio.templateId = "minimal";
  assert.equal(await hasTemplateAccess(user._id, "minimal"), true);
  assert.equal(await hasTemplateAccess(user._id, "unknown"), false);
});
test("checkout ignores client prices, simulation grants only the purchased template to its owner", async () => {
  const order = await request("/billing/templates/order", "POST", {
    templateId: "aurora",
    amount: 0.01,
    currency: "USD",
  });
  assert.equal(order.status, 200);
  const retry = await request("/billing/templates/order", "POST", {
    templateId: "aurora",
  });
  assert.equal(retry.data.orderId, order.data.orderId);
  assert.equal(order.data.template.amount, 5);
  assert.equal(order.data.template.currency, "INR");
  assert.equal(await hasTemplateAccess(user._id, "aurora"), false);
  const paid = await request("/billing/templates/simulate-success", "POST", {
    orderId: order.data.orderId,
  });
  assert.equal(paid.data.unlocked, true);
  assert.equal(await hasTemplateAccess(user._id, "aurora"), true);
  assert.equal(await hasTemplateAccess(other, "aurora"), false);
  assert.equal(await hasTemplateAccess(user._id, "kinetic"), false);
  assert.equal(
    (await request("/portfolio/template", "PUT", { templateId: "aurora" }))
      .status,
    200,
  );
  assert.equal(
    (await request("/portfolio/me", "PATCH", { templateId: "aurora" })).status,
    200,
  );
  assert.equal(
    (
      await request("/billing/templates/order", "POST", {
        templateId: "aurora",
      })
    ).status,
    409,
  );
  const repeated = await request(
    "/billing/templates/simulate-success",
    "POST",
    { orderId: order.data.orderId },
  );
  assert.equal(repeated.data.unlocked, true);
  const catalog = await request("/portfolio/templates");
  assert.equal(
    catalog.data.templates.find((t) => t.id === "aurora").unlocked,
    true,
  );
  const history = await request("/billing/history");
  assert.equal(history.data.payments[0].kind, "template");
  assert.equal(history.data.payments[0].amount, 5);
});
test("production never accepts simulated template payments", async () => {
  process.env.NODE_ENV = "production";
  assert.equal(await hasTemplateAccess(user._id, "aurora"), false);
  try {
    assert.equal(
      (
        await request("/billing/templates/simulate-success", "POST", {
          orderId: purchases[0].orderId,
        })
      ).status,
      404,
    );
  } finally {
    process.env.NODE_ENV = "test";
  }
});
test("capture validation binds exact order, amount, currency and captured status", () => {
  const purchase = { orderId: "order_test", amount: 5, currency: "INR" };
  const payment = {
    id: "pay_test",
    order_id: "order_test",
    amount: 500,
    currency: "INR",
    status: "captured",
  };
  assert.equal(matchesCapturedTemplatePayment(payment, purchase), true);
  for (const bad of [
    { amount: 1 },
    { currency: "USD" },
    { order_id: "order_other" },
    { status: "authorized" },
    { status: "failed" },
  ])
    assert.equal(
      matchesCapturedTemplatePayment({ ...payment, ...bad }, purchase),
      false,
    );
});
test("signed webhooks unlock template purchases idempotently without publishing", async () => {
  const purchase = await TemplatePurchase.create({
    ownerId: user._id,
    templateId: "kinetic",
    provider: "razorpay",
    orderId: "order_webhook",
    amount: 5,
    currency: "INR",
  });
  const event = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_webhook",
          order_id: purchase.orderId,
          amount: 500,
          currency: "INR",
          status: "captured",
        },
      },
    },
  };
  const body = Buffer.from(JSON.stringify(event));
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  let output;
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      output = data;
      return this;
    },
  };
  await webhook({ body, get: () => signature }, res);
  const paidAt = purchase.paidAt;
  assert.equal(output.templateUnlocked, true);
  assert.equal(purchase.status, "paid");
  await webhook({ body, get: () => signature }, res);
  assert.equal(purchase.paidAt, paidAt);
  assert.equal(await hasTemplateAccess(user._id, "kinetic"), true);
  const bad = await request("/billing/templates/verify", "POST", {
    razorpay_order_id: purchase.orderId,
    razorpay_payment_id: "pay_webhook",
    razorpay_signature: "invalid",
  });
  assert.equal(bad.status, 400);
});

test("environment price updates reach checkout without altering existing orders", async () => {
  try {
    process.env.animatedTemplatePrice = "12.50";
    const initial = await request("/billing/templates/order", "POST", {
      templateId: "opal",
      amount: 1,
    });
    assert.equal(initial.data.template.amount, 12.5);
    const order = purchases.find((p) => p.orderId === initial.data.orderId);
    assert.equal(order.amount, 12.5);
    process.env.animatedTemplatePrice = "20";
    const catalog = await request("/portfolio/templates");
    assert.equal(
      catalog.data.templates.find((t) => t.id === "opal").amount,
      20,
    );
    const next = await request("/billing/templates/order", "POST", {
      templateId: "opal",
    });
    assert.equal(next.data.template.amount, 20);
    assert.notEqual(next.data.orderId, initial.data.orderId);
    assert.equal(order.amount, 12.5);
    assert.equal(
      matchesCapturedTemplatePayment(
        {
          id: "oldpay",
          order_id: order.orderId,
          amount: 1250,
          currency: "INR",
          status: "captured",
        },
        order,
      ),
      true,
    );
  } finally {
    process.env.animatedTemplatePrice = "5";
  }
});
test("missing or invalid environment prices disable purchases", async () => {
  try {
    for (const invalid of [
      "",
      "abc",
      "-5",
      "0",
      "0.50",
      "1.001",
      "Infinity",
      "9007199254740992",
    ]) {
      process.env.animatedTemplatePrice = invalid;
      assert.equal(getTemplateConfig("terra").amount, null);
      assert.equal(getTemplateConfig("terra").purchasable, false);
      assert.equal(
        (
          await request("/billing/templates/order", "POST", {
            templateId: "terra",
          })
        ).status,
        503,
      );
    }
  } finally {
    process.env.animatedTemplatePrice = "5";
  }
});
