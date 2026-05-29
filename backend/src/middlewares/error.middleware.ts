import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  if (error.statusCode === 500) {
    console.error('[Unhandled Error]', error);
    try {
      require('fs').appendFileSync('error_log.txt', new Date().toISOString() + '\\n' + (error.stack || error.message) + '\\n\\n');
    } catch (e) {}
  }

  return res.status(error.statusCode || 500).json(response);
};
