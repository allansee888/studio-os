import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../../config/index';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Handler]:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues,
    });
  }

  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON payload',
    });
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

  return res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(config.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

