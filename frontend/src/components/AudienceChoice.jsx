import React from "react";
import { professions } from "../audience.js";
const choices = [
  ["student", "Student", "Education, projects & career goals"],
  ["professional", "Professional", "Experience, expertise & services"],
  ["other", "Other", "Build a profile that fits you"],
];
export default function AudienceChoice({ profile, onChange }) {
  return (
    <fieldset className="audience-choice">
      <legend>Make this portfolio yours</legend>
      <p id="audience-help">
        Choose a category to see relevant fields. You can change it later.
      </p>
      <div
        className="audience-options"
        role="radiogroup"
        aria-label="Your category"
        aria-describedby="audience-help"
      >
        {choices.map(([value, title, description]) => (
          <label
            key={value}
            className={
              "audience-option" +
              (profile.category === value ? " is-selected" : "")
            }
          >
            <input
              type="radio"
              name="category"
              value={value}
              checked={profile.category === value}
              onChange={() => onChange("category", value)}
            />
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </div>
      {profile.category && profile.category !== "student" && (
        <div className="form-grid">
          <label>
            Profession
            <select
              value={profile.profession || ""}
              onChange={(e) => onChange("profession", e.target.value)}
            >
              <option value="">Choose your profession</option>
              {professions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          {profile.profession === "Other" && (
            <label>
              Your profession
              <input
                maxLength={120}
                placeholder="e.g. Photographer"
                value={profile.customProfession || ""}
                onChange={(e) => onChange("customProfession", e.target.value)}
              />
            </label>
          )}
        </div>
      )}
    </fieldset>
  );
}
