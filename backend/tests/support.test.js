import test from "node:test";
import assert from "node:assert/strict";
import {
  getPublicContacts,
  getSupportContacts,
} from "../src/config/support.js";

test("public and private support contacts come from separate env settings", () => {
  const previous = {
    PUBLIC_NUMBER: process.env.PUBLIC_NUMBER,
    PUBLIC_EMAIL: process.env.PUBLIC_EMAIL,
    PRIVATE_NUMBER: process.env.PRIVATE_NUMBER,
    PRIVATE_EMAIL: process.env.PRIVATE_EMAIL,
  };

  process.env.PUBLIC_NUMBER = "+91 11111 11111";
  process.env.PUBLIC_EMAIL = "public@example.com";
  process.env.PRIVATE_NUMBER = "+91 22222 22222";
  process.env.PRIVATE_EMAIL = "private@example.com";

  try {
    assert.deepEqual(getPublicContacts(), {
      displayNumber: "+91 11111 11111",
      whatsappNumber: "911111111111",
      email: "public@example.com",
    });
    assert.deepEqual(getSupportContacts(), {
      displayNumber: "+91 22222 22222",
      whatsappNumber: "912222222222",
      email: "private@example.com",
    });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
