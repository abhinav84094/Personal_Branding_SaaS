import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import auth from "./routes/auth.js";
import portfolio from "./routes/portfolio.js";
import billing from "./routes/billing.js";
import Portfolio from "./models/Portfolio.js";
import PortfolioView from "./models/PortfolioView.js";
import { validUsername, normalizeUsername } from "./utils/username.js";
import { publicPortfolioProjection } from "./utils/publicPortfolio.js";
import { webhook } from "./services/webhook.js";
import { getPlans } from "./config/plans.js";
import { getSupportContacts } from "./config/support.js";
import {
  getPublicBaseDomain,
  getPublicPortfolioUrl,
} from "./config/domains.js";
dotenv.config();
const app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.CLIENT_URL];

      if (process.env.NODE_ENV !== "production") {
        allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
      }

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  webhook,
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  auth,
);
app.use("/api/portfolio", portfolio);
app.use("/api/billing", billing);
app.get("/api/config", (_req, res) =>
  res.json({
    plans: getPlans(),
    publicBaseDomain: getPublicBaseDomain(),
    support: getSupportContacts(),
    paymentSimulation:
      process.env.NODE_ENV !== "production" &&
      process.env.PAYMENT_SIMULATION_ENABLED === "true",
  }),
);
app.get("/api/public/:username", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.params.username);
    if (!validUsername(username))
      return res.status(404).json({ message: "Portfolio not found." });
    const p = await Portfolio.findOne({ username, status: "published" }).lean();
    if (!p)
      return res
        .status(404)
        .json({ message: "Portfolio not found or unavailable." });
    const Subscription = (await import("./models/Subscription.js")).default;
    const active = await Subscription.exists({
      ownerId: p.ownerId,
      status: "active",
      endsAt: { $gt: new Date() },
    });
    if (!active)
      return res
        .status(404)
        .json({ message: "Portfolio not found or unavailable." });
    const day = new Date().toISOString().slice(0, 10);
    await PortfolioView.updateOne(
      { username, day },
      { $inc: { views: 1 } },
      { upsert: true },
    );
    const safe = publicPortfolioProjection(p);
    res.json({
      portfolio: safe,
      canonical: getPublicPortfolioUrl(username),
    });
  } catch (e) {
    next(e);
  }
});
app.get("/api/public-host", async (req, res, next) => {
  try {
    const host = (req.headers.host || "").split(":")[0].toLowerCase();
    const baseDomains = [
      process.env.APP_BASE_DOMAIN || "localhost",
      getPublicBaseDomain(),
    ];
    const matchingDomain = baseDomains.find((domain) =>
      host.endsWith(`.${domain.toLowerCase()}`),
    );
    const prefix = matchingDomain
      ? host.slice(0, -matchingDomain.length - 1)
      : "";
    const reserved = new Set(
      "www api admin clinic personal venues coaching salon support help dashboard login register static assets mail smtp ftp blog".split(
        " ",
      ),
    );
    if (!prefix || prefix.includes(".") || reserved.has(prefix))
      return res.status(404).json({ message: "No public portfolio host." });
    const p = await Portfolio.findOne({
      username: prefix,
      status: "published",
    }).lean();
    if (!p) return res.status(404).json({ message: "Portfolio not found." });
    const Sub = (await import("./models/Subscription.js")).default;
    if (
      !(await Sub.exists({
        ownerId: p.ownerId,
        status: "active",
        endsAt: { $gt: new Date() },
      }))
    )
      return res.status(404).json({ message: "Portfolio not found." });
    const safe = publicPortfolioProjection(p);
    const day = new Date().toISOString().slice(0, 10);
    await PortfolioView.updateOne(
      { username: prefix, day },
      { $inc: { views: 1 } },
      { upsert: true },
    );
    return res.json({
      portfolio: safe,
      canonical: getPublicPortfolioUrl(prefix),
    });
  } catch (e) {
    next(e);
  }
});
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use((err, _req, res, _next) => {
  if (err.name === "ValidationError")
    return res
      .status(400)
      .json({ message: "Please check the submitted information." });
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});
const port = Number(process.env.PORT || 5000);
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/personal_branding",
    )
    .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
    .catch((e) => {
      console.error("MongoDB connection failed:", e.message);
      process.exit(1);
    });
}
export default app;
