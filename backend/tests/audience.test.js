import test from "node:test";
import assert from "node:assert/strict";
import { profileSchema } from "../src/utils/validation.js";
import Portfolio from "../src/models/Portfolio.js";
test("legacy profiles remain valid", () => {
  assert.equal(
    profileSchema.safeParse({
      profile: { fullName: "Legacy" },
      templateId: "minimal",
    }).success,
    true,
  );
});
test("audience fields validate and persist in the portfolio model", () => {
  for (const category of ["student", "professional", "other"]) {
    const payload = {
      profile: {
        fullName: "Test",
        category,
        profession: "Electrician",
        institution: "College",
        serviceArea: "Patna",
      },
      templateId: category === "student" ? "student" : "services",
    };
    assert.equal(profileSchema.safeParse(payload).success, true);
    const doc = new Portfolio({
      ...payload,
      ownerId: "507f1f77bcf86cd799439011",
    });
    assert.equal(doc.validateSync(), undefined);
    assert.equal(doc.profile.category, category);
    assert.equal(doc.profile.serviceArea, "Patna");
  }
});
test("unknown categories and overlong details are rejected", () => {
  assert.equal(
    profileSchema.safeParse({ profile: { category: "invalid" } }).success,
    false,
  );
  assert.equal(
    profileSchema.safeParse({ profile: { services: "a".repeat(281) } }).success,
    false,
  );
});

test("modern template validates for new and existing profiles", () => {
  for (const profile of [
    { fullName: "Existing" },
    { fullName: "Student", category: "student" },
    { fullName: "Professional", category: "professional" },
  ]) {
    assert.equal(
      profileSchema.safeParse({ profile, templateId: "modern" }).success,
      true,
    );
    const doc = new Portfolio({
      profile,
      templateId: "modern",
      ownerId: "507f1f77bcf86cd799439011",
    });
    assert.equal(doc.validateSync(), undefined);
    assert.equal(doc.templateId, "modern");
  }
});
