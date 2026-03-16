import nodemailer from 'nodemailer';
import { IUser } from '../types';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // ============================================
  // PLANTILLAS DE EMAIL
  // ============================================
  private getBaseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CoursePlatform</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CoursePlatform. Todos los derechos reservados.</p>
            <p>Si no solicitaste este email, por favor ignóralo.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================
  // ENVÍO DE EMAILS
  // ============================================
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"CoursePlatform" <${process.env.SMTP_FROM || 'noreply@courseplatform.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error al enviar el email');
    }
  }

  // ============================================
  // EMAILS ESPECÍFICOS
  // ============================================
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const content = `
      <h2>¡Bienvenido a CoursePlatform!</h2>
      <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>
      <center>
        <a href="${verificationUrl}" class="button">Verificar mi email</a>
      </center>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
      <p>Este enlace expirará en 24 horas.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verifica tu email - CoursePlatform',
      html: this.getBaseTemplate(content)
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const content = `
      <h2>Recuperación de contraseña</h2>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
      <center>
        <a href="${resetUrl}" class="button">Restablecer contraseña</a>
      </center>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
      <p>Este enlace expirará en 1 hora por seguridad.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Recuperación de contraseña - CoursePlatform',
      html: this.getBaseTemplate(content)
    });
  }

  async sendPasswordChangedConfirmation(email: string): Promise<void> {
    const content = `
      <h2>Contraseña actualizada</h2>
      <p>Tu contraseña ha sido cambiada exitosamente.</p>
      <p>Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.</p>
      <center>
        <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar sesión</a>
      </center>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Tu contraseña ha sido actualizada - CoursePlatform',
      html: this.getBaseTemplate(content)
    });
  }

  async sendWelcomeEmail(user: IUser): Promise<void> {
    const content = `
      <h2>¡Bienvenido, ${user.firstName}!</h2>
      <p>Tu cuenta ha sido verificada exitosamente. Estamos emocionados de tenerte con nosotros.</p>
      <p>Con CoursePlatform puedes:</p>
      <ul>
        <li>Acceder a cursos de alta calidad</li>
        <li>Aprender a tu propio ritmo</li>
        <li>Obtener certificados de completación</li>
        <li>Interactuar con instructores y otros estudiantes</li>
      </ul>
      <center>
        <a href="${process.env.FRONTEND_URL}/courses" class="button">Explorar cursos</a>
      </center>
    `;

    await this.sendEmail({
      to: user.email,
      subject: '¡Bienvenido a CoursePlatform!',
      html: this.getBaseTemplate(content)
    });
  }

  async sendEnrollmentConfirmation(
    email: string,
    courseName: string,
    courseUrl: string
  ): Promise<void> {
    const content = `
      <h2>¡Inscripción confirmada!</h2>
      <p>Te has inscrito exitosamente en el curso:</p>
      <h3 style="color: #667eea;">${courseName}</h3>
      <p>¡Comienza tu aprendizaje ahora!</p>
      <center>
        <a href="${courseUrl}" class="button">Ir al curso</a>
      </center>
      <p>Puedes acceder a tu curso en cualquier momento desde tu panel de estudiante.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Inscripción confirmada: ${courseName}`,
      html: this.getBaseTemplate(content)
    });
  }

  async sendCourseCompletionEmail(
    email: string,
    courseName: string,
    certificateUrl?: string
  ): Promise<void> {
    const content = `
      <h2>¡Felicitaciones! 🎉</h2>
      <p>Has completado exitosamente el curso:</p>
      <h3 style="color: #667eea;">${courseName}</h3>
      <p>Tu dedicación y esfuerzo han dado frutos. ¡Sigue así!</p>
      ${certificateUrl ? `
      <p>Tu certificado está listo para descargar:</p>
      <center>
        <a href="${certificateUrl}" class="button">Descargar certificado</a>
      </center>
      ` : ''}
      <center>
        <a href="${process.env.FRONTEND_URL}/courses" class="button">Explorar más cursos</a>
      </center>
    `;

    await this.sendEmail({
      to: email,
      subject: `¡Curso completado: ${courseName}!`,
      html: this.getBaseTemplate(content)
    });
  }

  async sendNewEnrollmentNotification(
    instructorEmail: string,
    studentName: string,
    courseName: string
  ): Promise<void> {
    const content = `
      <h2>Nueva inscripción</h2>
      <p><strong>${studentName}</strong> se ha inscrito en tu curso:</p>
      <h3 style="color: #667eea;">${courseName}</h3>
      <p>Revisa el panel de instructor para ver más detalles.</p>
      <center>
        <a href="${process.env.FRONTEND_URL}/instructor/dashboard" class="button">Ver panel</a>
      </center>
    `;

    await this.sendEmail({
      to: instructorEmail,
      subject: `Nueva inscripción en: ${courseName}`,
      html: this.getBaseTemplate(content)
    });
  }

  async sendAssignmentGradedEmail(
    email: string,
    courseName: string,
    lessonTitle: string,
    grade: number,
    feedback?: string
  ): Promise<void> {
    const content = `
      <h2>Tarea calificada</h2>
      <p>Tu tarea en el curso <strong>${courseName}</strong> ha sido calificada:</p>
      <h3 style="color: #667eea;">${lessonTitle}</h3>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;"><strong>Calificación: ${grade}/100</strong></p>
        ${feedback ? `<p style="margin-top: 10px;"><strong>Comentarios:</strong> ${feedback}</p>` : ''}
      </div>
      <center>
        <a href="${process.env.FRONTEND_URL}/my-courses" class="button">Ver mis cursos</a>
      </center>
    `;

    await this.sendEmail({
      to: email,
      subject: `Tarea calificada: ${lessonTitle}`,
      html: this.getBaseTemplate(content)
    });
  }
}
