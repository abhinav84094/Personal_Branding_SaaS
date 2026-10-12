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

export default function TemplateA({ portfolio = {}, preview = false }) {
  const profile = portfolio.profile || {};

  return (
    <main className="portfolio minimal">
      <PortfolioNavigation
        name={profile.fullName}
        socials={portfolio.socials}
      />
      <PortfolioHero profile={profile} />
      <AboutSection bio={profile.bio} />
      <SkillsSection skills={portfolio.skills} />
      <ProjectsSection projects={portfolio.projects} />
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
