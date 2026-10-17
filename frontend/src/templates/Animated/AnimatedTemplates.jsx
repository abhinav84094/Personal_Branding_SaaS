import React from "react";
import ModernStudio from "../ModernStudio/ModernStudio.jsx";
import "./animated-templates.css";
import "./aesthetic-templates.css";
export function AuroraMotion(props) {
  return <ModernStudio {...props} variant="motion-aurora" />;
}
export function KineticStudio(props) {
  return <ModernStudio {...props} variant="motion-kinetic" />;
}
export function OpalGlass(props) {
  return <ModernStudio {...props} variant="motion-opal" />;
}
export function NoirAtelier(props) {
  return <ModernStudio {...props} variant="motion-noir" />;
}
export function TerraBloom(props) {
  return <ModernStudio {...props} variant="motion-terra" />;
}
export function AnimatedTemplatePreview({ template }) {
  return (
    <div
      className={"tile-preview motion-mini " + ("motion-mini-" + template.id)}
    >
      <small>ANIMATED · PREMIUM</small>
      <div className="motion-mini-orb" aria-hidden="true" />
      <h3>{template.name}</h3>
      <span>{template.copy}</span>
      <span className="motion-mini-note">
        Motion that respects reduced-motion settings
      </span>
    </div>
  );
}
