import { rateLimit } from "express-rate-limit";
import { ForbiddenError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

// General API rate limiter: max 500 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,
  standardHeaders: "draft-8", // draft-6, draft-7, draft-8
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ForbiddenError("Too many requests from this IP, please try again after 15 minutes", ErrorCodes.FORBIDDEN));
  },
});

// Login rate limiter: max 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ForbiddenError("Too many login attempts from this IP, please try again after 15 minutes", ErrorCodes.FORBIDDEN));
  },
});
