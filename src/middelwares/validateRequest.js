import { ValidationError } from "./customErrors.js";

/**
 * Express middleware to validate request using a Joi schema.
 * Validates body, query, and params. Strips unknown fields.
 * 
 * @param {import('joi').ObjectSchema} schema Joi schema containing body, query, and/or params object schemas
 */
export const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(
    {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    { abortEarly: false, stripUnknown: true }
  );

  if (error) {
    const details = error.details.reduce((acc, detail) => {
      // Group errors by their path
      const path = detail.path.join(".");
      acc[path] = detail.message;
      return acc;
    }, {});
    
    throw new ValidationError("Validation failed", details);
  }

  // Assign validated and sanitized values back to the request object
  if (value.body !== undefined) {
    req.body = value.body;
  }
  if (value.query !== undefined && req.query) {
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, value.query);
  }
  if (value.params !== undefined && req.params) {
    for (const key of Object.keys(req.params)) {
      delete req.params[key];
    }
    Object.assign(req.params, value.params);
  }
  next();
};
