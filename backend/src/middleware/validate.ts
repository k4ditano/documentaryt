import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult, check } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return next({
      statusCode: 400,
      message: errors.array()[0].msg
    });
  };
};

// Validaciones comunes
export const commonValidations = {
  id: (field: string = 'id') => 
    check(field)
      .isInt()
      .withMessage('Debe ser un número entero válido'),
  
  email: (field: string = 'email') =>
    check(field)
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
  
  password: (field: string = 'password') =>
    check(field)
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/\d/)
      .withMessage('La contraseña debe contener al menos un número'),
  
  username: (field: string = 'username') =>
    check(field)
      .isLength({ min: 3 })
      .withMessage('El nombre de usuario debe tener al menos 3 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
}; 