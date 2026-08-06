import { NotFoundError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

export const notFoundMiddleware = (req, res, next) => {
  throw new NotFoundError(
    `Route ${req.method} ${req.originalUrl} not found`,
    ErrorCodes.ROUTE_NOT_FOUND
  );
};
