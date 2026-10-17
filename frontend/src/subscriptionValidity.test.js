import test from "node:test";
import assert from "node:assert/strict";
import {
  subscriptionValidity,
  projectedExpiry,
  DAY_MS,
} from "./subscriptionValidity.js";
const now = Date.parse("2026-10-17T12:00:00Z");
test("countdown splits days, hours, minutes and seconds accurately", () => {
  const state = subscriptionValidity(
    {
      status: "active",
      endsAt: new Date(
        now + 20 * DAY_MS + 3 * 3600000 + 4 * 60000 + 5000,
      ).toISOString(),
    },
    now,
  );
  assert.deepEqual(
    [state.days, state.hours, state.minutes, state.seconds],
    [20, 3, 4, 5],
  );
  assert.equal(state.canRenew, true);
  assert.equal(state.active, true);
});
test("renewal becomes available only below 30 days, and countdown never goes negative", () => {
  assert.equal(
    subscriptionValidity(
      { status: "active", endsAt: new Date(now + 30 * DAY_MS) },
      now,
    ).canRenew,
    false,
  );
  assert.equal(
    subscriptionValidity(
      { status: "active", endsAt: new Date(now + 30 * DAY_MS - 1) },
      now,
    ).canRenew,
    true,
  );
  const expired = subscriptionValidity(
    { status: "active", endsAt: new Date(now - 1) },
    now,
  );
  assert.equal(expired.remainingMs, 0);
  assert.equal(expired.expired, true);
  assert.equal(expired.canRenew, true);
  assert.equal(subscriptionValidity(null, now).canRenew, false);
  assert.equal(subscriptionValidity({ status: "pending" }, now).hasTerm, false);
});
test("renewal projection preserves remaining days or starts today after expiry", () => {
  assert.equal(
    +projectedExpiry(
      { status: "active", endsAt: new Date(now + 20 * DAY_MS) },
      90,
      now,
    ),
    now + 110 * DAY_MS,
  );
  assert.equal(
    +projectedExpiry(
      { status: "expired", endsAt: new Date(now - DAY_MS) },
      90,
      now,
    ),
    now + 90 * DAY_MS,
  );
});
