import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { CookieOptions } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        id: number;
      };
      emitUpdate?: (userId: number, event: string, data: any) => void;
    }

    interface Response extends ExpressResponse {
      cookie(name: string, value: any, options: CookieOptions): this;
      status(code: number): this;
      json(body: any): this;
      send(body: any): this;
    }
  }
} 