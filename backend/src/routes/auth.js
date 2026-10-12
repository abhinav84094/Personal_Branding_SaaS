import { Router } from "express";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import { signSession, protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
const r = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 86400000,
  path: "/",
};
r.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase(),
      password = req.body.password;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password || "")))
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    res.cookie("accessToken", signSession(user), cookieOptions);
    res.json({ user: { id: user.id, name: user.name, email } });
  } catch (e) {
    next(e);
  }
});
r.post("/google", async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID)
      return res
        .status(503)
        .json({ message: "Google sign-in is not configured." });
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.email_verified)
      return res
        .status(401)
        .json({ message: "Google account email is not verified." });
    const email = p.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: p.sub }, { email }] });
    if (user && !user.googleId) {
      user.googleId = p.sub;
      await user.save();
    }
    if (!user) {
      user = await User.create({
        name: p.name || email.split("@")[0],
        email,
        googleId: p.sub,
        password: cryptoRandom(),
        passwordConfigured: false,
      });
      await Portfolio.create({
        ownerId: user._id,
        profile: { fullName: user.name },
      });
    }
    await Portfolio.updateOne(
      { ownerId: user._id },
      { $setOnInsert: { ownerId: user._id, profile: { fullName: user.name } } },
      { upsert: true },
    );
    if (!user.passwordConfigured) {
      const setupToken = jwt.sign(
        {
          sub: user._id.toString(),
          version: user.tokenVersion || 0,
          setup: true,
        },
        process.env.JWT_SECRET,
        { algorithm: "HS256", expiresIn: "15m" },
      );
      res.cookie("setupToken", setupToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      return res.json({
        needsPassword: true,
        user: { name: user.name, email: user.email },
      });
    }
    res.cookie("accessToken", signSession(user), cookieOptions);
    return res.json({
      needsPassword: false,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({
        message: "An account already exists for this Google identity.",
      });
    next(e);
  }
});
function cryptoRandom() {
  return `${crypto.randomBytes(32).toString("hex")}Aa9!`;
}
async function requirePasswordSetup(req, res, next) {
  try {
    const token = req.cookies?.setupToken;
    if (!token)
      return res
        .status(401)
        .json({ message: "Start with Google sign-in to create your account." });
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (payload.setup !== true)
      return res
        .status(401)
        .json({ message: "Password setup session is invalid." });
    const user = await User.findById(payload.sub);
    if (
      !user ||
      user.passwordConfigured ||
      (user.tokenVersion || 0) !== payload.version
    )
      return res.status(401).json({
        message: "Password setup session expired. Sign in with Google again.",
      });
    req.setupUser = user;
    next();
  } catch {
    return res.status(401).json({
      message: "Password setup session expired. Sign in with Google again.",
    });
  }
}
r.get("/password-setup", requirePasswordSetup, (req, res) =>
  res.json({ user: { name: req.setupUser.name, email: req.setupUser.email } }),
);
r.post("/set-password", requirePasswordSetup, async (req, res, next) => {
  try {
    const password = req.body?.password;
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    )
      return res
        .status(400)
        .json({ message: "Choose a password between 8 and 128 characters." });
    const user = req.setupUser;
    user.password = password;
    user.passwordConfigured = true;
    await user.save();
    res.clearCookie("setupToken", { ...cookieOptions, maxAge: undefined });
    res.cookie("accessToken", signSession(user), cookieOptions);
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
});
r.get("/me", protect, (req, res) =>
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
  }),
);
r.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { ...cookieOptions, maxAge: undefined });
  res.json({ success: true });
});
export default r;
