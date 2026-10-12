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

export default function TemplateB({ portfolio = {}, preview = false }) {
  const profile = portfolio.profile || {};

  return (
    <main className="portfolio developer">
      <PortfolioNavigation
        name={profile.fullName}
        socials={portfolio.socials}
      />
      <PortfolioHero profile={profile} />
      <SkillsSection skills={portfolio.skills} />
      <ProjectsSection projects={portfolio.projects} />
      <AboutSection bio={profile.bio} />
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
