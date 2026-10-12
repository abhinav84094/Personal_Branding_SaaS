export const RESERVED = new Set(
  "www api admin clinic personal venues coaching salon support help dashboard login register static assets mail smtp ftp blog app billing docs status".split(
    " ",
  ),
);
export function normalizeUsername(input = "") {
  return String(input).trim().toLowerCase();
}
export function validUsername(input = "") {
  const name = normalizeUsername(input);
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(name) && !RESERVED.has(name);
}
