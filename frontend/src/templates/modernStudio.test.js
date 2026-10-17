import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
let server, ModernStudio;
before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL("../../", import.meta.url)),
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true },
    appType: "custom",
  });
  ModernStudio = (
    await server.ssrLoadModule("/src/templates/ModernStudio/ModernStudio.jsx")
  ).default;
});
after(async () => {
  await server?.close();
});
const render = (portfolio) =>
  renderToStaticMarkup(React.createElement(ModernStudio, { portfolio }));
test("modern template hides empty sections and private phone numbers", () => {
  const html = render({
    profile: {
      fullName: "Test User",
      contactNumber: "9000000000",
      showContact: false,
    },
  });
  assert.ok(!html.includes("9000000000"));
  assert.ok(!html.includes('id="ms-work"'));
  assert.ok(!html.includes('id="ms-about"'));
  assert.ok(!html.includes('id="ms-contact"'));
  assert.ok(!html.includes('href="#ms-work"'));
});
test("modern template renders student details and rejects unsafe media and links", () => {
  const html = render({
    profile: {
      fullName: "Student",
      category: "student",
      institution: "Example College",
      profileImage: "javascript:alert(1)",
    },
    projects: [
      {
        title: "My project",
        liveUrl: "javascript:alert(1)",
        imageUrl: "javascript:alert(1)",
      },
    ],
    socials: { Unsafe: "javascript:alert(1)" },
  });
  assert.ok(html.includes("Example College"));
  assert.ok(html.includes("My project"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(!html.includes("<img"));
});
test("modern template supports contact opt-in, experience, and all registered components", async () => {
  const html = render({
    profile: {
      fullName: "Professional",
      contactNumber: "9000000000",
      showContact: true,
    },
    experience: [
      {
        title: "Engineer",
        institution: "Example Co",
        startDate: "2021",
        endDate: "2025",
      },
    ],
  });
  assert.ok(html.includes('href="tel:9000000000"'));
  assert.ok(html.includes("Engineer"));
  assert.ok(html.includes("2021 — 2025"));
  const { templates } = await server.ssrLoadModule(
    "/src/templates/registry.js",
  );
  assert.ok(
    templates.every((template) => typeof template.component === "function"),
  );
});

test("animated templates render distinctive themes and motion controls", async () => {
  const { AuroraMotion, KineticStudio, OpalGlass, NoirAtelier, TerraBloom } =
    await server.ssrLoadModule("/src/templates/Animated/AnimatedTemplates.jsx");
  for (const [Component, theme] of [
    [AuroraMotion, "motion-aurora"],
    [KineticStudio, "motion-kinetic"],
    [OpalGlass, "motion-opal"],
    [NoirAtelier, "motion-noir"],
    [TerraBloom, "motion-terra"],
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(Component, {
        portfolio: { profile: { fullName: "Motion Test" } },
      }),
    );
    assert.ok(html.includes("ms-" + theme));
    assert.ok(html.includes("Pause animations"));
  }
});

test("password fields are hidden by default and have labelled non-submit visibility buttons", async () => {
  const { default: PasswordField } = await server.ssrLoadModule(
    "/src/components/PasswordField.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(PasswordField, {
      label: "New password",
      value: "",
      onChange: () => {},
    }),
  );
  assert.ok(html.includes('type="password"'));
  assert.ok(html.includes('type="button"'));
  assert.ok(html.includes('aria-label="Show new password"'));
  assert.ok(html.includes('aria-pressed="false"'));
  assert.match(html, /autocomplete="new-password"/i);
});
