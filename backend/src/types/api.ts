import { Response } from 'express';

export interface ApiResponse {
  success: true;
  data?: any;
  message?: string;
}

export interface ErrorDetail {
  message: string;
  statusCode: number;
  status: string;
  stack?: string;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
  message?: string;
}

export interface UserResponse {
  id: number;
  username?: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthResponse extends ApiResponse {
  token: string;
  user: UserResponse;
}

export interface CustomResponse extends Response {
  status(code: number): this;
  json(body: ApiResponse | ErrorResponse | AuthResponse): this;
} 