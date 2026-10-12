import test from "node:test";
import assert from "node:assert/strict";
import { publicPortfolioProjection } from "../src/utils/publicPortfolio.js";
test("private contact is removed from public projection by default", () => {
  const p = publicPortfolioProjection({
    ownerId: "secret",
    __v: 0,
    profile: { fullName: "A", contactNumber: "123", showContact: false },
  });
  assert.equal(p.profile.contactNumber, undefined);
  assert.equal(p.ownerId, undefined);
});
test("contact is public only after explicit opt-in", () => {
  const p = publicPortfolioProjection({
    profile: { contactNumber: "123", showContact: true },
  });
  assert.equal(p.profile.contactNumber, "123");
});
