import jwt from "jsonwebtoken";

// ─── AUTH BYPASS ─────────────────────────────────────────────────────────────
// Set BYPASS_AUTH=true in .env to disable token checks (dev / demo mode).
// Must match LOGIN_REQUIRED=false on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const BYPASS = process.env.BYPASS_AUTH === "true";

export const authenticate = (req, res, next) => {
  if (BYPASS) {
    req.user = { id: 0, email: "admin@admin.com", role: "admin" };
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
