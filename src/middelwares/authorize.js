import { UnauthorizedError, ForbiddenError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

// authorize(...roles) — call after authenticate middleware
// e.g. router.delete('/users/:id', authenticate, authorize('admin'), deleteUser)
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("User is not authenticated", ErrorCodes.UNAUTHORIZED);
  }
  if (!roles.includes(req.user.role)) {
    throw new ForbiddenError("Forbidden: insufficient permissions", ErrorCodes.FORBIDDEN);
  }
  next();
};

