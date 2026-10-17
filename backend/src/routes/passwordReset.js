import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
export const passwordResetGoogleClient = new OAuth2Client();
const r = Router();
const expiryMs = 15 * 60 * 1000;
const options = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
});
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const sessionQuery = (req) =>
  typeof req.cookies?.passwordResetToken === "string" &&
  /^[a-f0-9]{64}$/.test(req.cookies.passwordResetToken)
    ? {
        passwordResetTokenHash: hash(req.cookies.passwordResetToken),
        passwordResetExpiresAt: { $gt: new Date() },
      }
    : null;
const invalid = {
  message:
    "Your reset session has expired or was already used. Verify your Google account again.",
};
const limiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
  });
r.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
r.post("/password-reset/google", limiter(), async (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID)
    return res
      .status(503)
      .json({ message: "Google verification is currently unavailable." });
  if (
    typeof req.body?.credential !== "string" ||
    !req.body.credential ||
    req.body.credential.length > 10000
  )
    return res
      .status(400)
      .json({ message: "Please verify your account with Google." });
  let payload;
  try {
    const ticket = await passwordResetGoogleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res
      .status(401)
      .json({ message: "Google verification failed. Please try again." });
  }
  if (!payload?.email_verified || !payload.email || !payload.sub)
    return res
      .status(401)
      .json({ message: "Google account email is not verified." });
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.findOneAndUpdate(
      { email: payload.email.toLowerCase(), googleId: payload.sub },
      {
        $set: {
          passwordResetTokenHash: hash(token),
          passwordResetExpiresAt: new Date(Date.now() + expiryMs),
        },
      },
      { new: true },
    );
    if (!user)
      return res
        .status(403)
        .json({
          message: "Use the Google account you used to create your account.",
        });
    res.cookie("passwordResetToken", token, { ...options(), maxAge: expiryMs });
    res.json({ verified: true });
  } catch (e) {
    next(e);
  }
});
r.get("/password-reset-session", async (req, res, next) => {
  try {
    const query = sessionQuery(req);
    if (!query) return res.status(401).json(invalid);
    const user = await User.findOne(query).select("email");
    if (!user) return res.status(401).json(invalid);
    res.json({ user: { email: user.email } });
  } catch (e) {
    next(e);
  }
});
r.post("/reset-password", limiter(), async (req, res, next) => {
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
    const query = sessionQuery(req);
    if (!query) return res.status(401).json(invalid);
    // Avoid expensive password hashing for invalid or expired reset sessions.
    if (!(await User.exists(query))) return res.status(401).json(invalid);
    const encrypted = await bcrypt.hash(password, 12);
    const user = await User.findOneAndUpdate(
      query,
      {
        $set: { password: encrypted, passwordConfigured: true },
        $inc: { tokenVersion: 1 },
        $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
      },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(401).json(invalid);
    res.clearCookie("passwordResetToken", options());
    for (const cookie of ["accessToken", "setupToken"])
      res.clearCookie(cookie, { ...options(), path: "/" });
    res.json({
      success: true,
      message: "Your password has been reset. Sign in with your new password.",
    });
  } catch (e) {
    next(e);
  }
});
export default r;
