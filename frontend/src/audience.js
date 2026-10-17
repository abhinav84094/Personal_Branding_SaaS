export const professions = [
  "Software developer",
  "Designer / creative",
  "Teacher / educator",
  "Electrician",
  "Plumber",
  "Consultant",
  "Business owner",
  "Other",
];
export function audienceFields(profile = {}) {
  if (profile.category === "student")
    return ["institution", "course", "graduationYear", "goal"];
  if (!profile.category) return [];
  if (["Electrician", "Plumber"].includes(profile.profession))
    return [
      "yearsExperience",
      "specialization",
      "services",
      "serviceArea",
      "availability",
    ];
  return [
    "company",
    "yearsExperience",
    "specialization",
    "services",
    "availability",
  ];
}
export const fieldLabels = {
  institution: "School / college",
  course: "Course / degree",
  graduationYear: "Graduation year",
  goal: "Career goal",
  company: "Company / organisation",
  yearsExperience: "Years of experience",
  specialization: "Specialization",
  services: "Services offered",
  serviceArea: "Service area",
  availability: "Availability",
};
export function recommendedTemplate(profile = {}) {
  if (profile.category === "student") return "student";
  if (["Electrician", "Plumber"].includes(profile.profession))
    return "services";
  if (profile.profession === "Software developer") return "developer";
  if (profile.profession === "Designer / creative") return "creative";
  return "professional";
}
