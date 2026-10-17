import { AudienceDetails } from "../AudienceDetails.jsx";
import React from "react";
import {
  AboutSection,
  CareerSection,
  PortfolioFooter,
  PortfolioHero,
  PortfolioNavigation,
  PreviewRibbon,
  ProjectsSection,
  SkillsSection,
} from "../PortfolioSections.jsx";

export default function TemplateC({ portfolio = {}, preview = false }) {
  const profile = portfolio.profile || {};

  return (
    <main className="portfolio creative">
      <PortfolioNavigation
        name={profile.fullName}
        socials={portfolio.socials}
      />
      <PortfolioHero profile={profile} />
      <AudienceDetails profile={profile} />
      <AboutSection bio={profile.bio} />
      <ProjectsSection projects={portfolio.projects} />
      <SkillsSection skills={portfolio.skills} />
      <CareerSection title="Experience" entries={portfolio.experience} />
      <CareerSection title="Education" entries={portfolio.education} />
      <CareerSection
        title="Certifications"
        entries={portfolio.certifications}
      />
      <PortfolioFooter profile={profile} />
      {preview && <PreviewRibbon />}
    </main>
  );
}
