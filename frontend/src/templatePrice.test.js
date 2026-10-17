import test from "node:test";
import assert from "node:assert/strict";
import { formatTemplatePrice } from "./components/templatePrice.js";
test("template labels format the server amount, including fractional rupees", () => {
  assert.equal(
    formatTemplatePrice({ amount: 12.5, currency: "INR" }),
    "₹12.50",
  );
  assert.equal(formatTemplatePrice({ amount: 99, currency: "INR" }), "₹99.00");
});
test("missing or unavailable prices do not invent an amount", () => {
  for (const config of [
    undefined,
    { amount: null },
    { amount: 0 },
    { amount: 5, purchasable: false },
  ])
    assert.equal(formatTemplatePrice(config), null);
});
