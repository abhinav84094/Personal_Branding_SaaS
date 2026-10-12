import test from "node:test";
import assert from "node:assert/strict";
import {
  RESERVED,
  normalizeUsername,
  validUsername,
} from "../src/utils/username.js";
test("canonical usernames lowercase and trim", () =>
  assert.equal(normalizeUsername("  Rahul-S  "), "rahul-s"));
test("valid username rules accept letters numbers and inner hyphens", () => {
  for (const x of ["abc", "rahul", "rahul-sharma", "abc123", "a".repeat(30)])
    assert.equal(validUsername(x), true);
});
test("invalid format and reserved system subdomains are rejected", () => {
  for (const x of [
    "a",
    "ab",
    "a".repeat(31),
    "-rahul",
    "rahul-",
    "rahul.sharma",
    "api",
    "personal",
    "clinic",
    "www",
  ])
    assert.equal(validUsername(x), false);
});
test("reserved namespace is centralized", () => {
  for (const x of [
    "www",
    "api",
    "admin",
    "clinic",
    "personal",
    "venues",
    "coaching",
    "salon",
    "support",
    "help",
    "dashboard",
    "login",
    "register",
    "static",
    "assets",
    "app",
    "billing",
    "docs",
    "mail",
    "smtp",
    "ftp",
    "blog",
    "status",
  ])
    assert.equal(RESERVED.has(x), true);
});
