import { normalizeUsername, validUsername } from "./username.js";

export function usernameFromHost(hostname, baseDomains) {
  const host = String(hostname || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
  const domain = baseDomains
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    )
    .find((value) => value && host.endsWith(`.${value}`));

  if (!domain) return null;
  const username = normalizeUsername(host.slice(0, -(domain.length + 1)));
  return !username.includes(".") && validUsername(username) ? username : null;
}

export function usernameFromOrigin(origin, baseDomains) {
  try {
    return usernameFromHost(new URL(origin).hostname, baseDomains);
  } catch {
    return null;
  }
}
