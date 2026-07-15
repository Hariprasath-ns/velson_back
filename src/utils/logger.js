import crypto from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        message,
        ...meta,
      })
    );
  },
  warn: (message, meta = {}) => {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "WARN",
        message,
        ...meta,
      })
    );
  },
  error: (message, error, meta = {}) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        message,
        errorMessage: error?.message,
        errorCode: error?.errorCode,
        stack: error?.stack,
        ...meta,
      })
    );
  },
};
