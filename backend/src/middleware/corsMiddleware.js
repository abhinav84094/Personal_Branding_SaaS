import cors from "cors";
import { getPublicBaseDomain } from "../config/domains.js";
import { usernameFromOrigin } from "../utils/publicHost.js";

function isPortfolioSubdomain(origin) {
  return Boolean(
    usernameFromOrigin(origin, [getPublicBaseDomain(), "localhost"]),
  );
}

function isAllowedPublicOrigin(origin) {
  if (!origin || isPortfolioSubdomain(origin)) return true;
  const allowedOrigins = [process.env.CLIENT_URL];
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
  }
  return allowedOrigins.includes(origin);
}

const publicPortfolioCors = cors({
  origin(origin, callback) {
    if (isAllowedPublicOrigin(origin)) return callback(null, true);
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
