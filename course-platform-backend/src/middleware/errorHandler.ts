import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// ============================================
// CLASES DE ERROR PERSONALIZADAS
// ============================================

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual') {
    super(message, 409);
  }
}

// ============================================
// MANEJADOR DE ERRORES
// ============================================

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log del error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId
  });

  // Errores operacionales (conocidos)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined
    });
    return;
  }

  // Errores de Mongoose - CastError (ID inválido)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Valor inválido para ${err.path}: ${err.value}`
    });
    return;
  }

  // Errores de Mongoose - Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(409).json({
      success: false,
      message: `El valor para '${field}' ya existe`
    });
    return;
  }

  // Errores de Mongoose - ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
    return;
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
    return;
  }

  // Errores de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'Archivo demasiado grande'
    });
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado'
    });
    return;
  }

  // Error por defecto (no operacional)
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: err.message,
      stack: err.stack
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Algo salió mal'
    });
  }
};

// ============================================
// WRAPPER PARA CONTROLADORES ASÍNCRONOS
// ============================================

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
