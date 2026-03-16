import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUserDocument } from '../models/User';
import { IAuthResponse, ITokenPayload, UserRole } from '../types';
import { EmailService } from './EmailService';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly RESET_TOKEN_EXPIRY = 3600000; // 1 hora

  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // ============================================
  // REGISTRO DE USUARIO
  // ============================================
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<IAuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear usuario
    const user = await User.create({
      ...userData,
      role: userData.role || UserRole.STUDENT
    });

    // Generar token de verificación de email
    const verificationToken = this.generateEmailVerificationToken(user);

    // Enviar email de verificación
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Generar tokens JWT
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  // ============================================
  // LOGIN DE USUARIO
  // ============================================
  async login(email: string, password: string): Promise<IAuthResponse> {
    // Buscar usuario con password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('La cuenta ha sido desactivada');
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar tokens JWT
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================
  async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, AuthService.JWT_REFRESH_SECRET) as ITokenPayload;

      // Buscar usuario
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('Token inválido');
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens
      };
    } catch (error) {
      throw new Error('Token de refresco inválido');
    }
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no
      return;
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Guardar token hash
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + AuthService.RESET_TOKEN_EXPIRY);
    await user.save();

    // Enviar email
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash del token recibido
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Enviar confirmación
    await this.emailService.sendPasswordChangedConfirmation(user.email);
  }

  // ============================================
  // VERIFICACIÓN DE EMAIL
  // ============================================
  async verifyEmail(token: string): Promise<void> {
    // Hash del token
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario
    const user = await User.findOne({
      emailVerificationToken: tokenHash
    });

    if (!user) {
      throw new Error('Token de verificación inválido');
    }

    // Marcar email como verificado
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    if (user.isEmailVerified) {
      throw new Error('El email ya está verificado');
    }

    const token = this.generateEmailVerificationToken(user);
    await this.emailService.sendVerificationEmail(email, token);
  }

  // ============================================
  // CAMBIO DE CONTRASEÑA
  // ============================================
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Enviar confirmación
    await this.emailService.sendPasswordChangedConfirmation(user.email);
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================
  private generateTokens(user: IUserDocument): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const payload: ITokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, AuthService.JWT_SECRET, {
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(payload, AuthService.JWT_REFRESH_SECRET, {
      expiresIn: AuthService.REFRESH_TOKEN_EXPIRY
    });

    // Decodificar para obtener expiración
    const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
    const expiresIn = decoded.exp! - Math.floor(Date.now() / 1000);

    return { accessToken, refreshToken, expiresIn };
  }

  private generateEmailVerificationToken(user: IUserDocument): string {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    user.emailVerificationToken = tokenHash;
    user.save();
    
    return token;
  }

  private sanitizeUser(user: IUserDocument): Omit<IUserDocument, 'password'> {
    const userObj = user.toObject();
    delete (userObj as any).password;
    delete (userObj as any).resetPasswordToken;
    delete (userObj as any).resetPasswordExpire;
    delete (userObj as any).emailVerificationToken;
    delete (userObj as any).twoFactorSecret;
    return userObj;
  }

  // ============================================
  // MÉTODOS ESTÁTICOS PARA MIDDLEWARE
  // ============================================
  static verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, AuthService.JWT_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  static async getUserFromToken(token: string): Promise<IUserDocument | null> {
    try {
      const decoded = this.verifyAccessToken(token);
      return await User.findById(decoded.userId);
    } catch (error) {
      return null;
    }
  }
}
