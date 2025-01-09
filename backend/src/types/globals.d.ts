/// <reference types="node" />
/// <reference types="express" />

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
        username?: string;
      };
      emitUpdate?: (userId: number, event: string, data: any) => void;
    }
  }
}

export {}; 