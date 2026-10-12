import test from "node:test";
import assert from "node:assert/strict";
import {
  usernameFromHost,
  usernameFromOrigin,
} from "../src/utils/publicHost.js";

const domains = ["prakashsaas.world", "localhost"];

test("tenant is resolved from custom host and origin with ports", () => {
  assert.equal(
    usernameFromHost("abhinav.prakashsaas.world:443", domains),
    "abhinav",
  );
  assert.equal(
    usernameFromOrigin("http://abhinav.localhost:5173", domains),
    "abhinav",
  );
});

test("base, nested, and reserved hosts are not tenant subdomains", () => {
  assert.equal(usernameFromHost("prakashsaas.world", domains), null);
  assert.equal(
    usernameFromHost("deep.abhinav.prakashsaas.world", domains),
    null,
  );
  assert.equal(
    usernameFromOrigin("https://api.prakashsaas.world", domains),
    null,
  );
});
