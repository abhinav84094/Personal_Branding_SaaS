export function publicPortfolioProjection(input) {
  const p = { ...input, profile: { ...(input?.profile || {}) } };
  if (!p.profile.showContact) delete p.profile.contactNumber;
  delete p.ownerId;
  delete p.__v;
  return p;
}
