import test from "node:test";
import assert from "node:assert/strict";
import { templateDefinitions } from "./templates/templateDefinitions.js";
test("template registry includes three distinct portfolio looks", () =>
  assert.deepEqual(
    templateDefinitions.map((x) => x.id),
    ["minimal", "developer", "creative"],
  ));
