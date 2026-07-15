import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UnauthorizedError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

// ─── AUTH BYPASS ─────────────────────────────────────────────────────────────
// Set BYPASS_AUTH=true in .env to disable token checks (dev / demo mode).
// Must match LOGIN_REQUIRED=false on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const BYPASS = process.env.BYPASS_AUTH === "true";

export const signPath = (path) => {
  const timestamp = Date.now();
  const secret = process.env.DOWNLOAD_SECRET || process.env.JWT_SECRET || "default_download_secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${path}`)
    .digest("hex");
  return `${path}?token=${timestamp}.${signature}`;
};

export const authenticate = async (req, res, next) => {
  try {
    if (BYPASS) {
      req.user = { id: 0, email: "admin@admin.com", role: "admin" };
      return next();
    }

    const header = req.headers.authorization;

    // Check signed token query parameter first for GET download paths if no auth header is provided
    if (!header && req.method === "GET" && req.query.token) {
      const token = req.query.token;
      const [timestampStr, signature] = token.split(".");
      if (timestampStr && signature) {
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        // Check 1-minute expiration (60000ms)
        if (Math.abs(now - timestamp) > 60000) {
          throw new UnauthorizedError("Download token is expired", ErrorCodes.TOKEN_EXPIRED);
        }
        const secret = process.env.DOWNLOAD_SECRET || process.env.JWT_SECRET || "default_download_secret";
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(`${timestampStr}.${req.path}`)
          .digest("hex");

        if (signature === expectedSignature) {
          req.user = { id: 0, email: "download@admin.com", role: "user" };
          return next();
        }
      }
      throw new UnauthorizedError("Download token is invalid", ErrorCodes.TOKEN_INVALID);
    }

    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token is missing", ErrorCodes.UNAUTHORIZED);
    }

    const token = header.slice(7);
    
    // (1) Verify signature and expiration first
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // (2) Only after signature verification succeeds, check jti against blacklist
    if (decoded.jti) {
      const isBlacklisted = await req.db.tokenBlacklist.findUnique({
        where: { jti: decoded.jti }
      });
      if (isBlacklisted) {
        throw new UnauthorizedError("Authorization token is blacklisted", ErrorCodes.TOKEN_INVALID);
      }
    }

    req.user = decoded; // { id, email, role, jti }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Authorization token is expired", ErrorCodes.TOKEN_EXPIRED));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Authorization token is invalid", ErrorCodes.TOKEN_INVALID));
    }
    next(err);
  }
};

