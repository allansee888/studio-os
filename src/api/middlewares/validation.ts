import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware factory for validating incoming requests using Zod schemas.
 */
export const validateRequest = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((issue) => issue.message),
        });
      }
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validateRequest(schema, "body");
export const validateQuery = (schema: ZodSchema) => validateRequest(schema, "query");
export const validateParams = (schema: ZodSchema) => validateRequest(schema, "params");
