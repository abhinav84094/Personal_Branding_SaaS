import React from "react";
import { audienceFields, fieldLabels } from "../audience.js";
import {
  PortfolioNavigation,
  PortfolioHero,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  CareerSection,
  PortfolioFooter,
  PreviewRibbon,
} from "./PortfolioSections.jsx";
export default function AudienceTemplate({ portfolio = {}, preview = false }) {
  const profile = portfolio.profile || {};
  const student = portfolio.templateId === "student";
  return (
    <main
      className={
        "portfolio audience-layout " +
        (portfolio.templateId === "services"
          ? "minimal service-layout"
          : student
            ? "creative student-layout"
            : "developer")
      }
    >
      <PortfolioNavigation
        name={profile.fullName}
        socials={portfolio.socials}
      />
      <PortfolioHero profile={profile} />
      <section className="audience-details">
        <small>
          {student ? "LEARNING & AMBITION" : "EXPERTISE & SERVICES"}
        </small>
        <h2>
          {student
            ? "My student journey"
            : (profile.profession === "Other"
                ? profile.customProfession
                : profile.profession) || "How I can help"}
        </h2>
        <dl>
          {audienceFields(profile)
            .filter((key) => profile[key])
            .map((key) => (
              <div key={key}>
                <dt>{fieldLabels[key]}</dt>
                <dd>{profile[key]}</dd>
              </div>
            ))}
        </dl>
      </section>
      <AboutSection bio={profile.bio} />
      {student && (
        <CareerSection title="Education" entries={portfolio.education} />
      )}
      <SkillsSection skills={portfolio.skills} />
      <ProjectsSection projects={portfolio.projects} />
      <CareerSection
        title={student ? "Internships & experience" : "Experience"}
        entries={portfolio.experience}
      />
      {!student && (
        <CareerSection title="Education" entries={portfolio.education} />
      )}
      <CareerSection
        title="Certifications"
        entries={portfolio.certifications}
      />
      <PortfolioFooter profile={profile} />
      {preview && <PreviewRibbon />}
    </main>
  );
}
