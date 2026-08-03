import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/index';

// Placeholder for future authentication
export const requireAuthPlaceholder = (req: Request, res: Response, next: NextFunction) => {
  // Always proceed for sprint 0
  next();
};

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.NODE_ENV === 'development' ? err.message : undefined
  });
};
