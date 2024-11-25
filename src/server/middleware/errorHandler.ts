import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from '../utils/errors';
import { ZodError } from 'zod';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof DatabaseError) {
    const statusCode = error.code === 'NOT_FOUND' ? 404 : 400;
    return res.status(statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: error.errors,
      },
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
    },
  });
}