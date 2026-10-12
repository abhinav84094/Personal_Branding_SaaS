import test from "node:test";
import assert from "node:assert/strict";
import { templates } from "./templates/registry.js";
test("template registry includes three distinct portfolio looks", () =>
  assert.deepEqual(
    templates.map((x) => x.id),
    ["minimal", "developer", "creative"],
  ));
