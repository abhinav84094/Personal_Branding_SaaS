import React from "react";
import { audienceFields, fieldLabels } from "../audience.js";
export function AudienceDetails({ profile = {} }) {
  const fields = audienceFields(profile).filter((key) => profile[key]);
  if (!fields.length) return null;
  return (
    <section className="audience-details">
      <h2>
        {profile.category === "student"
          ? "My student journey"
          : "Expertise & services"}
      </h2>
      <dl>
        {fields.map((key) => (
          <div key={key}>
            <dt>{fieldLabels[key]}</dt>
            <dd>{profile[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
