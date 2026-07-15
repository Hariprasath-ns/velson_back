import { AppError } from "./customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Log detailed audit & context information for debugging
  const context = {
    requestId: req.id,
    path: req.originalUrl || req.path,
    method: req.method,
    userId: req.user?.id || null,
    userRole: req.user?.role || null,
    clientIp: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  };

  // Express JSON parser body-parser syntax error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error = new AppError("Invalid JSON payload", 400, ErrorCodes.INVALID_PAYLOAD);
  }

  // Multer Error (file upload)
  else if (err.name === "MulterError") {
    let errorCode = ErrorCodes.FILE_UPLOAD_ERROR;
    let message = `File upload error: ${err.message}`;
    if (err.code === "LIMIT_FILE_SIZE") {
      errorCode = ErrorCodes.FILE_TOO_LARGE;
      message = "Uploaded file exceeds the maximum size limit";
    }
    error = new AppError(message, 400, errorCode, { field: err.field });
  }

  // JWT Errors
  else if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid or expired authorization token", 401, ErrorCodes.TOKEN_INVALID);
  }
  else if (err.name === "TokenExpiredError") {
    error = new AppError("Authorization token has expired", 401, ErrorCodes.TOKEN_EXPIRED);
  }

  // Prisma Database Errors
  else if (err.code) {
    // Unique constraint violation
    if (err.code === "P2002") {
      const target = err.meta?.target || [];
      error = new AppError(
        `Unique constraint violation: ${target.join(", ") || "Record"} already exists`,
        409,
        ErrorCodes.DUPLICATE_RECORD,
        { target }
      );
    }
    // Foreign key constraint violation
    else if (err.code === "P2003") {
      const field = err.meta?.field_name || "";
      error = new AppError(
        `Foreign key constraint violation on field: ${field}`,
        400,
        ErrorCodes.FOREIGN_KEY_VIOLATION,
        { field }
      );
    }
    // Record not found
    else if (err.code === "P2025") {
      error = new AppError(
        err.meta?.cause || "Record not found",
        404,
        ErrorCodes.RESOURCE_NOT_FOUND
      );
    }
    // Connection errors
    else if (["P1000", "P1001", "P1002", "P1003", "P1008", "P1017", "P2024"].includes(err.code)) {
      error = new AppError(
        "Database connection failure. Please try again later.",
        500,
        ErrorCodes.DATABASE_CONNECTION_FAILURE
      );
    }
  }

  // Fallback to internal server error if it's not a custom AppError
  if (!(error instanceof AppError)) {
    const message = process.env.NODE_ENV === "production" 
      ? "An unexpected error occurred on the server" 
      : err.message || "Internal Server Error";
    error = new AppError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    // Retain stack trace from original error for system level log
    error.stack = err.stack;
  }

  // Log error with request context using the structured logger
  logger.error(`Error handling request [${req.method}] ${req.path}`, error, context);

  // Send standardized JSON response
  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  const responseBody = {
    success: false,
    statusCode,
    message: error.message,
    errorCode: error.errorCode,
    details: error.details || {},
    requestId: req.id,
  };

  // Stack trace details for debugging (development mode only)
  if (!isProd) {
    responseBody.stack = error.stack;
  }

  res.status(statusCode).json(responseBody);
};
