import { getCurrentSubscription } from "../services/subscriptionValidity.js";
import {
  hasTemplateAccess,
  getTemplateAccessCatalog,
  templatePaymentRequired,
} from "../services/templateAccess.js";
import { TEMPLATE_IDS } from "../config/templates.js";
import { Router } from "express";
import Portfolio from "../models/Portfolio.js";
import PortfolioView from "../models/PortfolioView.js";
import Subscription from "../models/Subscription.js";
import { protect } from "../middleware/auth.js";
import { validUsername, normalizeUsername } from "../utils/username.js";
import { profileSchema } from "../utils/validation.js";
import { getPlans } from "../config/plans.js";
import {
  getPublicBaseDomain,
  getPublicPortfolioUrl,
} from "../config/domains.js";
import { getSupportContacts } from "../config/support.js";
const r = Router();
r.use(protect);
const getMine = async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ ownerId: req.user._id });
    if (!p) return res.status(404).json({ message: "Portfolio not found." });
    res.json({ portfolio: p });
  } catch (e) {
    next(e);
  }
};
r.get("/me", getMine);
r.patch("/me", async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Some portfolio details are invalid.",
        errors: parsed.error.issues,
      });
    if (
      parsed.data.templateId &&
      !(await hasTemplateAccess(req.user._id, parsed.data.templateId))
    )
      return res.status(402).json(templatePaymentRequired);
    const p = await Portfolio.findOneAndUpdate(
      { ownerId: req.user._id },
      { $set: parsed.data },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    res.json({ portfolio: p });
  } catch (e) {
    next(e);
  }
});
r.get("/username/:name", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.params.name);
    if (!validUsername(username))
      return res.json({
        available: false,
        message:
          "Use 3–30 letters, numbers or hyphens. Reserved names are unavailable.",
      });
    const used = await Portfolio.exists({
      username,
      ownerId: { $ne: req.user._id },
    });
    res.json({
      available: !used,
      username,
      message: used ? "That username is taken." : "That username is available.",
    });
  } catch (e) {
    next(e);
  }
});
r.put("/username", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body.username);
    if (!validUsername(username))
      return res.status(400).json({
        message: "That username is reserved or has an invalid format.",
      });
    const p = await Portfolio.findOneAndUpdate(
      {
        ownerId: req.user._id,
        $or: [
          { username: { $exists: false } },
          { username: null },
          { username: "" },
        ],
      },
      {
        $set: {
          username,
          onboardingStep: Math.max(5, req.body.onboardingStep || 5),
        },
      },
      { new: true },
    );

    if (!p) {
      const existingPortfolio = await Portfolio.findOne({
        ownerId: req.user._id,
      }).select("username");

      if (existingPortfolio?.username) {
        return res.status(409).json({
          message: "Your profile address is already set and cannot be changed.",
        });
      }

      return res.status(404).json({
        message:
          "Your profile could not be found. Please refresh and try again.",
      });
    }

    res.json({ portfolio: p });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({
        message: "That username was just claimed. Please choose another.",
      });
    next(e);
  }
});
r.get("/templates", async (req, res, next) => {
  try {
    res.json({ templates: await getTemplateAccessCatalog(req.user._id) });
  } catch (e) {
    next(e);
  }
});
r.put("/template", async (req, res, next) => {
  try {
    if (!TEMPLATE_IDS.includes(req.body.templateId))
      return res
        .status(400)
        .json({ message: "Choose one of the available templates." });
    if (!(await hasTemplateAccess(req.user._id, req.body.templateId)))
      return res.status(402).json(templatePaymentRequired);
    const p = await Portfolio.findOneAndUpdate(
      { ownerId: req.user._id },
      { $set: { templateId: req.body.templateId } },
      { new: true },
    );
    res.json({ portfolio: p });
  } catch (e) {
    next(e);
  }
});
r.post("/publish", async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ ownerId: req.user._id });
    if (
      !p?.profile?.fullName?.trim() ||
      !p.profile.contactNumber?.trim() ||
      !p.username ||
      !TEMPLATE_IDS.includes(p.templateId)
    )
      return res.status(400).json({
        message:
          "Add your name and contact number, choose a username and template before publishing.",
      });
    if (!(await hasTemplateAccess(req.user._id, p.templateId)))
      return res.status(402).json(templatePaymentRequired);
    const sub = await Subscription.findOne({
      ownerId: req.user._id,
      status: "active",
      endsAt: { $gt: new Date() },
    });
    if (!sub)
      return res.status(402).json({
        message: "An active Personal Branding plan is required to publish.",
      });
    p.status = "published";
    p.publishedAt = new Date();
    await p.save();
    res.json({
      portfolio: p,
      publicUrl:
        process.env.NODE_ENV !== "production" && process.env.PUBLIC_BASE_URL
          ? `${process.env.PUBLIC_BASE_URL}/p/${p.username}`
          : getPublicPortfolioUrl(p.username),
    });
  } catch (e) {
    next(e);
  }
});
r.post("/unpublish", async (req, res, next) => {
  try {
    const p = await Portfolio.findOneAndUpdate(
      { ownerId: req.user._id },
      { $set: { status: "unpublished" } },
      { new: true },
    );
    res.json({ portfolio: p });
  } catch (e) {
    next(e);
  }
});
r.get("/subscription", async (req, res, next) => {
  try {
    const subscription = await getCurrentSubscription(req.user._id);
    const portfolio = await Portfolio.findOne({ ownerId: req.user._id })
      .select("username status")
      .lean();
    const publicUrl =
      subscription?.status === "active" &&
      portfolio?.status === "published" &&
      portfolio.username
        ? process.env.NODE_ENV !== "production" && process.env.PUBLIC_BASE_URL
          ? `${process.env.PUBLIC_BASE_URL}/p/${portfolio.username}`
          : getPublicPortfolioUrl(portfolio.username)
        : "";
    res.json({
      templates: await getTemplateAccessCatalog(req.user._id),
      plans: getPlans(),
      publicBaseDomain: getPublicBaseDomain(),
      supportContacts: getSupportContacts(),
      subscription,
      serverTime: new Date().toISOString(),
      publicUrl,
    });
  } catch (e) {
    next(e);
  }
});
r.get("/analytics", async (req, res, next) => {
  try {
    const p = await Portfolio.findOne({ ownerId: req.user._id }).select(
      "username",
    );
    if (!p) return res.json({ totalViews: 0, days: [] });
    const days = await PortfolioView.find({ username: p.username })
      .sort({ day: 1 })
      .limit(30)
      .lean();
    res.json({ totalViews: days.reduce((n, x) => n + x.views, 0), days });
  } catch (e) {
    next(e);
  }
});
export default r;
