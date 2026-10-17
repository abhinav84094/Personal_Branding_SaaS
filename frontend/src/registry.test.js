import test from "node:test";
import assert from "node:assert/strict";
import { templateDefinitions } from "./templates/templateDefinitions.js";
import { audienceFields, recommendedTemplate } from "./audience.js";
test("registry preserves legacy templates and adds audience layouts", () => {
  assert.deepEqual(
    templateDefinitions.map((x) => x.id),
    [
      "opal",
      "noir",
      "terra",
      "aurora",
      "kinetic",
      "modern",
      "student",
      "professional",
      "services",
      "minimal",
      "developer",
      "creative",
    ],
  );
});
test("legacy profiles need no category and student fields ignore saved profession", () => {
  assert.deepEqual(audienceFields({}), []);
  assert.deepEqual(
    audienceFields({ category: "student", profession: "Electrician" }),
    ["institution", "course", "graduationYear", "goal"],
  );
  assert.equal(
    recommendedTemplate({ category: "student", profession: "Electrician" }),
    "student",
  );
});
test("profession recommendations and service fields match the audience", () => {
  assert.equal(
    recommendedTemplate({
      category: "professional",
      profession: "Electrician",
    }),
    "services",
  );
  assert.ok(
    audienceFields({
      category: "professional",
      profession: "Plumber",
    }).includes("serviceArea"),
  );
  assert.equal(
    recommendedTemplate({
      category: "professional",
      profession: "Software developer",
    }),
    "developer",
  );
  assert.equal(
    recommendedTemplate({ category: "other", profession: "Other" }),
    "professional",
  );
});
