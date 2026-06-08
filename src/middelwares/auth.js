import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

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
    throw new UnauthorizedError("Authorization token is missing", ErrorCodes.UNAUTHORIZED);
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    throw new UnauthorizedError("Authorization token is invalid or expired", ErrorCodes.TOKEN_INVALID);
  }
};

