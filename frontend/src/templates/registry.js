import {
  AuroraMotion,
  KineticStudio,
  OpalGlass,
  NoirAtelier,
  TerraBloom,
} from "./Animated/AnimatedTemplates.jsx";
import AudienceTemplate from "./AudienceTemplate.jsx";
import TemplateA from "./TemplateA/TemplateA.jsx";
import TemplateB from "./TemplateB/TemplateB.jsx";
import TemplateC from "./TemplateC/TemplateC.jsx";
import ModernStudio from "./ModernStudio/ModernStudio.jsx";
import { templateDefinitions } from "./templateDefinitions.js";
const components = {
  opal: OpalGlass,
  noir: NoirAtelier,
  terra: TerraBloom,
  aurora: AuroraMotion,
  kinetic: KineticStudio,
  modern: ModernStudio,
  student: AudienceTemplate,
  professional: AudienceTemplate,
  services: AudienceTemplate,
  minimal: TemplateA,
  developer: TemplateB,
  creative: TemplateC,
};
export const templates = templateDefinitions.map((definition) => ({
  ...definition,
  component: components[definition.id],
}));
