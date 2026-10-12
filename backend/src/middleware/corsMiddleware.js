import cors from "cors";
import { getPublicBaseDomain } from "../config/domains.js";

const reservedHosts = new Set(
  "www api admin clinic personal venues coaching salon support help dashboard login register static assets mail smtp ftp blog".split(
    " ",
  ),
);

function isPortfolioSubdomain(origin) {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    const domain = getPublicBaseDomain();

    if (domain === "localhost" && host.endsWith(".localhost")) {
      const username = host.slice(0, -".localhost".length);
      return Boolean(username && !username.includes(".") && !reservedHosts.has(username));
    }

    if (!host.endsWith(`.${domain}`)) return false;
    const username = host.slice(0, -(domain.length + 1));
    return Boolean(username && !username.includes(".") && !reservedHosts.has(username));
  } catch {
    return false;
  }
}

const publicPortfolioCors = cors({
  origin(origin, callback) {
    if (!origin || isPortfolioSubdomain(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
});

export function corsMiddleware(req, res, next) {
  const isPublicRoute =
    req.path === "/config" ||
    req.path === "/public-host" ||
    req.path.startsWith("/public/");
  if (!isPublicRoute) return next();

  const isReadOnlyRequest = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (!isReadOnlyRequest) return res.sendStatus(405);

  return publicPortfolioCors(req, res, (error) => {
    if (error) return next(error);
    if (req.method === "OPTIONS") return res.sendStatus(204);
    return next();
  });
}
