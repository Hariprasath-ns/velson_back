import { UnauthorizedError, ForbiddenError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

// authorize(...roles) — call after authenticate middleware
// e.g. router.delete('/users/:id', authenticate, authorize('admin'), deleteUser)
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError("User is not authenticated", ErrorCodes.UNAUTHORIZED);
  }
  const userRoleUpper = (req.user.role || "").toUpperCase();
  const allowedRolesUpper = roles.map(r => r.toUpperCase());
  if (!allowedRolesUpper.includes(userRoleUpper)) {
    throw new ForbiddenError("Forbidden: insufficient permissions", ErrorCodes.FORBIDDEN);
  }
  next();
};

