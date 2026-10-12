import jwt from "jsonwebtoken";
import User from "../models/User.js";
export function signSession(user) {
  return jwt.sign(
    { sub: user._id.toString(), version: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "7d" },
  );
}
export async function protect(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token)
      return res.status(401).json({ message: "Please sign in to continue." });
    const data = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(data.sub).select("-password");
    if (!user || (user.tokenVersion || 0) !== data.version)
      return res
        .status(401)
        .json({ message: "Your session has expired. Please sign in again." });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ message: "Please sign in to continue." });
  }
}
