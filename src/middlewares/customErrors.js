import { ErrorCodes } from "../utils/errorCodes.js";

export class AppError extends Error {
  constructor(message, statusCode, errorCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || ErrorCodes.INTERNAL_SERVER_ERROR;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", errorCode = ErrorCodes.BAD_REQUEST, details = {}) {
    super(message, 400, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", errorCode = ErrorCodes.UNAUTHORIZED, details = {}) {
    super(message, 401, errorCode, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: insufficient permissions", errorCode = ErrorCodes.FORBIDDEN, details = {}) {
    super(message, 403, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = ErrorCodes.RESOURCE_NOT_FOUND, details = {}) {
    super(message, 404, errorCode, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", errorCode = ErrorCodes.CONFLICT, details = {}) {
    super(message, 409, errorCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Error", details = {}, errorCode = ErrorCodes.VALIDATION_ERROR) {
    super(message, 422, errorCode, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", errorCode = ErrorCodes.INTERNAL_SERVER_ERROR, details = {}) {
    super(message, 500, errorCode, details);
  }
}
