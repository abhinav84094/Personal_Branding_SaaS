import React from "react";
import { templates } from "./registry.js";

export { templates };

export function PortfolioView({ portfolio = {}, preview = false }) {
  const Template =
    templates.find((template) => template.id === portfolio.templateId)
      ?.component ||
    templates.find((template) => template.id === "minimal").component;

  return <Template portfolio={portfolio} preview={preview} />;
}
