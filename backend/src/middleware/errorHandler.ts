import { Request, Response as ExpressResponse, NextFunction } from 'express';
import { CustomError } from '../utils/customError';

interface Response extends ExpressResponse {
  status(code: number): this;
  json(body: any): this;
}

const errorHandler = (
  err: Error | CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        status: err.status
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      message: 'Error interno del servidor',
      statusCode: 500,
      status: 'error'
    }
  });
};

export default errorHandler; 