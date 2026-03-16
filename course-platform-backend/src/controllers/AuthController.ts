import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { UserRole } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ============================================
  // VALIDACIONES
  // ============================================
  static validateRegister = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ max: 50 })
      .withMessage('El nombre no puede exceder 50 caracteres'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('El apellido es requerido')
      .isLength({ max: 50 })
      .withMessage('El apellido no puede exceder 50 caracteres')
  ];

  static validateLogin = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ];

  static validateForgotPassword = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido')
  ];

  static validateResetPassword = [
    body('token')
      .notEmpty()
      .withMessage('El token es requerido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
  ];

  static validateChangePassword = [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
  ];

  // ============================================
  // CONTROLADORES
  // ============================================
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar errores
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { email, password, firstName, lastName, role } = req.body;

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        role: role as UserRole
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      // Configurar cookie con refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token no proporcionado'
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // Limpiar cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { email } = req.body;
      await this.authService.forgotPassword(email);

      // Siempre responder éxito para no revelar si el email existe
      res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.'
      });
    } catch (error: any) {
      // No revelar errores
      res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.'
      });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Token inválido'
        });
        return;
      }

      await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verificado exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email requerido'
        });
        return;
      }

      await this.authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'Email de verificación reenviado'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.userId!;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const { User } = await import('../models/User');
      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
