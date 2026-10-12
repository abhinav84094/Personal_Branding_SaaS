export function getPublicBaseDomain() {
  const configuredDomain =
    process.env.PUBLIC_BASE_DOMAIN ||
    process.env.APP_BASE_DOMAIN ||
    "localhost";

  return configuredDomain
    .trim()
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
}

export function getPublicPortfolioUrl(username) {
  return `https://${username}.${getPublicBaseDomain()}`;
}
