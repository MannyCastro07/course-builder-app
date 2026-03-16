import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar rutas y middleware
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestValidator } from './middleware/validator';
import { logger } from './utils/logger';

// ============================================
// INICIALIZACIÓN DE LA APP
// ============================================
const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Helmet - Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Rate Limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, por favor intenta más tarde'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Sanitización de datos contra NoSQL injection
app.use(mongoSanitize());

// Prevención de HTTP Parameter Pollution
app.use(hpp());

// Compresión de respuestas
app.use(compression());

// ============================================
// MIDDLEWARE DE LOGGING Y PARSING
// ============================================

// Morgan para logging de peticiones HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Parsing de JSON y cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Validador de requests
app.use(requestValidator);

// ============================================
// RUTAS
// ============================================
app.use('/api', routes);

// ============================================
// SOCKET.IO
// ============================================
io.on('connection', (socket) => {
  logger.info(`Usuario conectado: ${socket.id}`);

  // Unirse a sala de curso
  socket.on('join-course', (courseId: string) => {
    socket.join(`course:${courseId}`);
    logger.info(`Usuario ${socket.id} se unió al curso ${courseId}`);
  });

  // Unirse a sala de lección
  socket.on('join-lesson', (lessonId: string) => {
    socket.join(`lesson:${lessonId}`);
    logger.info(`Usuario ${socket.id} se unió a la lección ${lessonId}`);
  });

  // Progreso de lección
  socket.on('lesson-progress', (data: { lessonId: string; progress: number }) => {
    socket.to(`lesson:${data.lessonId}`).emit('user-progress', {
      socketId: socket.id,
      progress: data.progress
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    logger.info(`Usuario desconectado: ${socket.id}`);
  });
});

// Exportar io para uso en controladores
export { io };

// ============================================
// RUTAS DE SALUD
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use(errorHandler);

// Ruta no encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ============================================
// CONEXIÓN A BASE DE DATOS
// ============================================
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
    
    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB conectado exitosamente');
  } catch (error) {
    logger.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    logger.info(`Servidor corriendo en modo ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Puerto: ${PORT}`);
    logger.info(`URL: http://localhost:${PORT}`);
  });
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Cerrando servidor...');
  logger.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...');
  logger.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Iniciar
startServer();

export default app;
