import TemplateA from "./TemplateA/TemplateA.jsx";
import TemplateB from "./TemplateB/TemplateB.jsx";
import TemplateC from "./TemplateC/TemplateC.jsx";
import { templateDefinitions } from "./templateDefinitions.js";

const components = [TemplateA, TemplateB, TemplateC];

export const templates = templateDefinitions.map((definition, index) => ({
  ...definition,
  component: components[index],
}));
