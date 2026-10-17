import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "../src/routes/auth.js";
import { passwordResetGoogleClient } from "../src/routes/passwordReset.js";
import User from "../src/models/User.js";
import { protect, signSession } from "../src/middleware/auth.js";
let server, base, user, resetCookie, oldSession;
const oldEnv = {};
const digest = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
const cookieFrom = (res) =>
  res.headers
    .getSetCookie()
    .find((c) => c.startsWith("passwordResetToken="))
    .split(";")[0];
before(async () => {
  for (const key of ["GOOGLE_CLIENT_ID", "JWT_SECRET", "NODE_ENV"])
    oldEnv[key] = process.env[key];
  Object.assign(process.env, {
    GOOGLE_CLIENT_ID: "reset-test-client",
    JWT_SECRET: "reset-test-session-secret",
    NODE_ENV: "test",
  });
  user = {
    _id: "507f1f77bcf86cd799439011",
    id: "507f1f77bcf86cd799439011",
    email: "person@example.com",
    name: "Test Person",
    googleId: "google-person",
    password: await bcrypt.hash("OldPassword123", 12),
    tokenVersion: 0,
    passwordConfigured: true,
  };
  user.comparePassword = (password) => bcrypt.compare(password, user.password);
  const matches = (q) =>
    Object.entries(q).every(([key, value]) =>
      value && typeof value === "object" && "$gt" in value
        ? user[key] && user[key] > value.$gt
        : user[key] === value,
    );
  test.mock.method(
    passwordResetGoogleClient,
    "verifyIdToken",
    async ({ idToken, audience }) => {
      assert.equal(audience, "reset-test-client");
      if (idToken === "broken") throw Error("bad token");
      return {
        getPayload: () => ({
          email: "person@example.com",
          sub: idToken === "other" ? "other-google" : "google-person",
          email_verified: idToken !== "unverified",
        }),
      };
    },
  );
  test.mock.method(User, "findOneAndUpdate", async (q, update) => {
    if (!matches(q)) return null;
    Object.assign(user, update.$set);
    for (const [key, amount] of Object.entries(update.$inc || {}))
      user[key] = (user[key] || 0) + amount;
    for (const key of Object.keys(update.$unset || {})) delete user[key];
    return user;
  });
  test.mock.method(User, "findOne", (q) => {
    const result = matches(q) ? user : null;
    return Object.assign(Promise.resolve(result), {
      select: async () => result,
    });
  });
  test.mock.method(User, "exists", async (q) =>
    matches(q) ? { _id: user._id } : null,
  );
  test.mock.method(User, "findById", (id) => ({
    select: async () => (id === user._id ? user : null),
  }));
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.get("/api/private", protect, (_req, res) => res.json({ ok: true }));
  app.use((e, _req, res, _next) =>
    res.status(500).json({ message: e.message }),
  );
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
  oldSession = "accessToken=" + signSession(user);
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  for (const [key, value] of Object.entries(oldEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
async function request(path, method = "GET", body, cookie) {
  return fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function verify() {
  const res = await request("/api/auth/password-reset/google", "POST", {
    credential: "valid",
  });
  assert.equal(res.status, 200);
  return cookieFrom(res);
}
test("reset requires Google verification and an existing matching Google account", async () => {
  assert.equal((await request("/api/auth/password-reset-session")).status, 401);
  assert.equal(
    (
      await request("/api/auth/reset-password", "POST", {
        password: "NewPassword123",
      })
    ).status,
    401,
  );
  for (const [credential, status] of [
    ["unverified", 401],
    ["other", 403],
    ["broken", 401],
  ]) {
    const res = await request("/api/auth/password-reset/google", "POST", {
      credential,
    });
    assert.equal(res.status, status);
    assert.ok(!res.headers.get("set-cookie"));
  }
});
test("verification stores only a hash, uses a short-lived HttpOnly cookie and supports session checks", async () => {
  resetCookie = await verify();
  const token = resetCookie.split("=")[1];
  assert.equal(user.passwordResetTokenHash, digest(token));
  assert.notEqual(user.passwordResetTokenHash, token);
  assert.ok(user.passwordResetExpiresAt > Date.now());
  assert.ok(user.passwordResetExpiresAt <= Date.now() + 15 * 60 * 1000);
  const res = await request(
    "/api/auth/password-reset-session",
    "GET",
    null,
    resetCookie,
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { user: { email: user.email } });
  assert.equal(res.headers.get("cache-control"), "no-store");
});
test("invalid new passwords do not consume the reset session", async () => {
  for (const password of ["short", "a".repeat(129)])
    assert.equal(
      (
        await request(
          "/api/auth/reset-password",
          "POST",
          { password },
          resetCookie,
        )
      ).status,
      400,
    );
  assert.equal(
    (
      await request(
        "/api/auth/password-reset-session",
        "GET",
        null,
        resetCookie,
      )
    ).status,
    200,
  );
});
test("new verification invalidates the previous reset token", async () => {
  const previous = resetCookie;
  resetCookie = await verify();
  assert.notEqual(resetCookie, previous);
  assert.equal(
    (await request("/api/auth/password-reset-session", "GET", null, previous))
      .status,
    401,
  );
});
test("reset hashes the password, revokes previous sessions and permits login with the new password", async () => {
  assert.equal(
    (await request("/api/private", "GET", null, oldSession)).status,
    200,
  );
  const res = await request(
    "/api/auth/reset-password",
    "POST",
    { password: "NewPassword123" },
    resetCookie,
  );
  assert.equal(res.status, 200);
  assert.ok(await bcrypt.compare("NewPassword123", user.password));
  assert.ok(!(await bcrypt.compare("OldPassword123", user.password)));
  assert.equal(user.tokenVersion, 1);
  assert.equal(user.passwordResetTokenHash, undefined);
  assert.equal(
    (await request("/api/private", "GET", null, oldSession)).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/login", "POST", {
        email: user.email,
        password: "OldPassword123",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/login", "POST", {
        email: user.email,
        password: "NewPassword123",
      })
    ).status,
    200,
  );
  const cleared = res.headers.getSetCookie();
  assert.ok(cleared.some((c) => c.startsWith("accessToken=;")));
  assert.ok(cleared.some((c) => c.startsWith("passwordResetToken=;")));
  assert.equal(
    (
      await request(
        "/api/auth/reset-password",
        "POST",
        { password: "AnotherPassword123" },
        resetCookie,
      )
    ).status,
    401,
  );
});
test("expired resets are rejected and concurrent attempts consume the token only once", async () => {
  resetCookie = await verify();
  user.passwordResetExpiresAt = new Date(Date.now() - 1000);
  assert.equal(
    (
      await request(
        "/api/auth/reset-password",
        "POST",
        { password: "ExpiredPassword123" },
        resetCookie,
      )
    ).status,
    401,
  );
  resetCookie = await verify();
  const results = await Promise.all([
    request(
      "/api/auth/reset-password",
      "POST",
      { password: "ConcurrentPassword123" },
      resetCookie,
    ),
    request(
      "/api/auth/reset-password",
      "POST",
      { password: "ConcurrentPassword456" },
      resetCookie,
    ),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 401]);
  assert.equal(user.tokenVersion, 2);
});
