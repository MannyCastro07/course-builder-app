# Course Platform Backend

Backend completo para una plataforma de cursos tipo LearnWorlds, construido con Node.js, TypeScript, Express y MongoDB.

## 🚀 Características

### Autenticación y Autorización
- ✅ Registro y login con JWT
- ✅ Roles de usuario (Admin, Instructor, Estudiante)
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Refresh tokens
- ✅ Autorización RBAC

### Gestión de Cursos
- ✅ CRUD completo de cursos
- ✅ Secciones y lecciones organizadas
- ✅ Múltiples tipos de contenido (video, texto, quiz, tareas, descargables, sesiones en vivo)
- ✅ Precios y descuentos
- ✅ Drip content (contenido programado)
- ✅ SEO para cursos
- ✅ Calificaciones y reseñas

### Gestión de Contenido Multimedia
- ✅ Subida de archivos a AWS S3
- ✅ Procesamiento de imágenes (resize, thumbnails)
- ✅ Transcoding de video (múltiples resoluciones)
- ✅ Streaming de video
- ✅ Gestión de subtítulos

### Inscripciones y Progreso
- ✅ Inscripción en cursos (gratis y de pago)
- ✅ Seguimiento de progreso
- ✅ Cuestionarios con calificación automática
- ✅ Tareas con calificación manual
- ✅ Certificados de completación

### Pagos
- ✅ Integración con Stripe
- ✅ Múltiples métodos de pago
- ✅ Historial de transacciones
- ✅ Reembolsos

### Notificaciones
- ✅ Email transaccionales
- ✅ Notificaciones en tiempo real con Socket.IO

### Reportes y Análisis
- ✅ Dashboard de instructor
- ✅ Estadísticas de cursos
- ✅ Ingresos y ventas

### Seguridad
- ✅ Rate limiting
- ✅ Protección contra XSS
- ✅ Sanitización de datos
- ✅ Helmet headers
- ✅ CORS configurado
- ✅ Validación de inputs

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación
├── controllers/      # Controladores de la API
├── middleware/       # Middleware personalizado
├── models/           # Modelos de Mongoose
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
├── types/            # Tipos de TypeScript
├── utils/            # Utilidades
└── server.ts         # Punto de entrada
```

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **AWS S3** - Almacenamiento de archivos
- **Stripe** - Procesamiento de pagos
- **Socket.IO** - Comunicación en tiempo real
- **Bull** - Colas de procesamiento
- **Redis** - Caché y colas
- **Nodemailer** - Envío de emails

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd course-platform-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Construir para producción:
```bash
npm run build
npm start
```

## 🔧 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Entorno (development/production) | Sí |
| `PORT` | Puerto del servidor | No (5000) |
| `MONGODB_URI` | URI de MongoDB | Sí |
| `JWT_SECRET` | Secreto para JWT | Sí |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | Sí |
| `AWS_ACCESS_KEY_ID` | Credenciales AWS | Producción |
| `AWS_SECRET_ACCESS_KEY` | Credenciales AWS | Producción |
| `AWS_S3_BUCKET` | Bucket de S3 | Producción |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | Producción |
| `SMTP_HOST` | Servidor SMTP | Producción |
| `SMTP_USER` | Usuario SMTP | Producción |
| `SMTP_PASS` | Contraseña SMTP | Producción |

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refrescar token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña
- `GET /api/auth/verify-email` - Verificar email
- `GET /api/auth/me` - Obtener usuario actual

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:slug` - Obtener curso por slug
- `POST /api/courses` - Crear curso (Instructor)
- `PUT /api/courses/:id` - Actualizar curso
- `DELETE /api/courses/:id` - Eliminar curso
- `POST /api/courses/:id/publish` - Publicar curso
- `POST /api/courses/:id/unpublish` - Despublicar curso
- `POST /api/courses/:id/duplicate` - Duplicar curso

### Secciones
- `GET /api/sections/:courseId/sections` - Listar secciones
- `POST /api/sections/:courseId` - Crear sección
- `PUT /api/sections/:id` - Actualizar sección
- `DELETE /api/sections/:id` - Eliminar sección
- `POST /api/sections/:courseId/reorder` - Reordenar secciones

### Lecciones
- `GET /api/lessons/:sectionId/lessons` - Listar lecciones
- `POST /api/lessons/:sectionId` - Crear lección
- `GET /api/lessons/:id` - Obtener lección
- `PUT /api/lessons/:id` - Actualizar lección
- `DELETE /api/lessons/:id` - Eliminar lección
- `POST /api/lessons/:id/complete` - Marcar como completada
- `POST /api/lessons/:id/quiz/submit` - Enviar quiz
- `POST /api/lessons/:id/assignment/submit` - Enviar tarea

### Inscripciones
- `GET /api/enrollments/my-enrollments` - Mis inscripciones
- `POST /api/enrollments/:courseId/enroll` - Inscribirse
- `POST /api/enrollments/confirm-payment` - Confirmar pago
- `GET /api/enrollments/:id/certificate` - Obtener certificado
- `GET /api/enrollments/:courseId/enrollments` - Inscripciones del curso

### Admin
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/stats` - Estadísticas

## 🔐 Seguridad

- **Autenticación JWT**: Tokens de acceso de corta duración con refresh tokens
- **Rate Limiting**: Límite de peticiones por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de orígenes permitidos
- **Sanitización**: Prevención de NoSQL injection y XSS
- **Validación**: Validación de inputs con express-validator
- **RBAC**: Control de acceso basado en roles

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👥 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
