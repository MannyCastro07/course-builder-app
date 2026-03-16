import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// ============================================
// MIDDLEWARE DE VALIDACIÓN
// ============================================

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Formatear errores
    const formattedErrors = errors.array().map(error => ({
      field: (error as any).path || error.param,
      message: error.msg,
      value: (error as any).value
    }));

    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: formattedErrors
    });
  };
};

// ============================================
// MIDDLEWARE DE VALIDACIÓN DE REQUEST
// ============================================

export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Validar que el Content-Type sea correcto para peticiones con body
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const contentType = req.headers['content-type'];
    
    if (contentType && !contentType.includes('application/json')) {
      // Permitir multipart/form-data para uploads
      if (!contentType.includes('multipart/form-data')) {
        res.status(415).json({
          success: false,
          message: 'Content-Type debe ser application/json'
        });
        return;
      }
    }
  }

  // Sanitizar inputs
  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

// ============================================
// FUNCIONES DE SANITIZACIÓN
// ============================================

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Eliminar espacios en blanco al inicio y final
      obj[key] = obj[key].trim();
      
      // Prevenir XSS básico
      obj[key] = obj[key]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// ============================================
// VALIDADORES PERSONALIZADOS
// ============================================

export const isValidMongoId = (value: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

export const isValidEmail = (value: string): boolean => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
};

export const isValidPassword = (value: string): boolean => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
};

export const isValidURL = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// SANITIZADORES PERSONALIZADOS
// ============================================

export const sanitizeString = (value: string): string => {
  return value
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const sanitizeHTML = (value: string): string => {
  // Permitir ciertas etiquetas HTML seguras
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
  
  // Implementación básica - en producción usar una librería como DOMPurify
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
};
