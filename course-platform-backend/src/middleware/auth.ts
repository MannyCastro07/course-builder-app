import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole, ITokenPayload } from '../types';

// ============================================
// EXTENSIÓN DE TIPOS DE EXPRESS
// ============================================
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      userId?: string;
    }
  }
}

// ============================================
// MIDDLEWARE: VERIFICAR AUTENTICACIÓN
// ============================================
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = AuthService.verifyAccessToken(token);
    
    // Agregar usuario al request
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

// ============================================
// MIDDLEWARE: VERIFICAR ROL
// ============================================
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Usuario no autenticado.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acceso prohibido. No tienes permisos para realizar esta acción.',
        requiredRoles: roles,
        yourRole: req.user.role
      });
      return;
    }

    next();
  };
};

// ============================================
// MIDDLEWARE: VERIFICAR PROPIETARIO O ADMIN
// ============================================
export const authorizeOwnerOrAdmin = (
  getOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado.'
      });
      return;
    }

    // Admin siempre tiene acceso
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Verificar si es el propietario
    const ownerId = await getOwnerId(req);
    
    if (ownerId && ownerId === req.user.userId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Acceso prohibido. No eres el propietario de este recurso.'
    });
  };
};

// ============================================
// MIDDLEWARE: VERIFICAR INSTRUCTOR DEL CURSO
// ============================================
export const authorizeCourseInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado.'
      });
      return;
    }

    // Admin siempre tiene acceso
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Instructor solo si es su curso
    if (req.user.role === UserRole.INSTRUCTOR) {
      const { Course } = await import('../models/Course');
      const course = await Course.findById(req.params.courseId || req.params.id);
      
      if (course && course.instructor.toString() === req.user.userId) {
        next();
        return;
      }
    }

    res.status(403).json({
      success: false,
      message: 'Acceso prohibido. No eres el instructor de este curso.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

// ============================================
// MIDDLEWARE: VERIFICAR INSCRIPCIÓN EN CURSO
// ============================================
export const requireEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado.'
      });
      return;
    }

    // Admin siempre tiene acceso
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    const courseId = req.params.courseId || req.params.id;
    const { Enrollment } = await import('../models/Enrollment');
    
    const isEnrolled = await Enrollment.isUserEnrolled(req.user.userId, courseId);
    
    if (!isEnrolled) {
      res.status(403).json({
        success: false,
        message: 'Debes estar inscrito en este curso para acceder a este contenido.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar inscripción'
    });
  }
};

// ============================================
// MIDDLEWARE OPCIONAL: USUARIO AUTENTICADO (SI EXISTE)
// ============================================
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Continuar sin usuario autenticado
    next();
  }
};

// ============================================
// MIDDLEWARE: VERIFICAR EMAIL VERIFICADO
// ============================================
export const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado.'
      });
      return;
    }

    const { User } = await import('../models/User');
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Debes verificar tu email para realizar esta acción.',
        action: 'verify_email'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar email'
    });
  }
};
