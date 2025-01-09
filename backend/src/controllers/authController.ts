import { Request, Response as ExpressResponse, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { CookieOptions } from 'express-serve-static-core';
import User from '../models/User';
import { CustomError } from '../utils/customError';
import { AuthResponse, ApiResponse, ErrorResponse } from '../types/api';

interface AuthRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  body: {
    username?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  user?: {
    id: number;
  };
}

interface Response extends ExpressResponse {
  cookie(name: string, value: any, options: CookieOptions): this;
  status(code: number): this;
  json(body: AuthResponse | ApiResponse | ErrorResponse): this;
}

// Función helper para enviar token en cookie
const sendTokenResponse = (
  user: User,
  statusCode: number,
  res: Response
): void => {
  const token = user.getSignedJwtToken();
  const cookieExpire = parseInt(process.env.COOKIE_EXPIRE || '30', 10);

  const options = {
    expires: new Date(
      Date.now() + cookieExpire * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user,
    } as AuthResponse);
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new CustomError('Por favor proporcione todos los campos requeridos', 400);
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      res.status(400).json({
        success: false,
        error: {
          message: 'El email ya está registrado',
          statusCode: 400,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Por favor proporcione email y contraseña',
          statusCode: 400,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    // Verificar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No autorizado',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No autorizado',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          statusCode: 404,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No autorizado',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          statusCode: 404,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    // Verificar contraseña actual
    if (!req.body.currentPassword || !req.body.newPassword) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Por favor proporcione la contraseña actual y la nueva',
          statusCode: 400,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Contraseña actual incorrecta',
          statusCode: 401,
          status: 'fail'
        }
      } as ErrorResponse);
      return;
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente',
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
}; 