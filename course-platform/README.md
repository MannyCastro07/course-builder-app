# EduPlatform - Sistema de Gestión de Cursos

Una plataforma completa de aprendizaje en línea tipo LearnWorlds, construida con React, TypeScript y Tailwind CSS.

## 🚀 Características

### Funcionalidades Principales

- **Autenticación y Autorización**
  - Login/Registro con validación
  - Recuperación de contraseña
  - Protección de rutas
  - Persistencia de sesión

- **Dashboard Administrativo**
  - Métricas en tiempo real
  - Gráficos y visualizaciones
  - Accesos rápidos

- **Gestión de Cursos**
  - Listado en vista grid/lista
  - Crear, editar, duplicar y eliminar cursos
  - Publicar/despublicar cursos
  - Editor visual drag-and-drop
  - Organizador de secciones y lecciones
  - Editor de contenido enriquecido
  - Previsualización responsive

- **Gestión de Estudiantes**
  - Tabla avanzada con filtros y búsqueda
  - Importación/Exportación de datos
  - Inscripción a cursos
  - Seguimiento de progreso

- **Reportes y Analíticas**
  - Gráficos de ingresos
  - Estadísticas de estudiantes
  - Rendimiento de cursos
  - Exportación de reportes

- **Configuración**
  - Personalización de marca
  - Configuración de email
  - Integración de pagos (Stripe/PayPal)
  - Preferencias de notificaciones

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Estado Global**: Zustand
- **Manejo de Datos**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Drag & Drop**: @dnd-kit
- **Editor**: TipTap
- **Notificaciones**: React Hot Toast

### Backend (API Mock)
- REST API con Axios
- Interceptores para autenticación
- Manejo de errores centralizado

## 📁 Estructura del Proyecto

```
course-platform/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI base (Button, Input, etc.)
│   │   ├── common/          # Componentes reutilizables (DataTable, FileUploader, etc.)
│   │   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   │   ├── charts/          # Componentes de gráficos
│   │   ├── course/          # Componentes específicos de cursos
│   │   ├── editor/          # Componentes del editor drag-and-drop
│   │   └── students/        # Componentes específicos de estudiantes
│   ├── pages/               # Páginas de la aplicación
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilidades
│   └── styles/              # Estilos globales
├── public/                  # Assets estáticos
└── package.json
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd course-platform

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Previsualizar build de producción
npm run lint     # Ejecutar ESLint
```

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (ej: `CourseEditor.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useCourses.ts`)
- **Stores**: camelCase (ej: `authStore.ts`)
- **Utilidades**: camelCase (ej: `formatDate.ts`)

### Estructura de Componentes
```tsx
// Imports
import React from 'react';
import { cn } from '@/utils';

// Types
interface ComponentProps {
  // ...
}

// Component
export function Component({ ... }: ComponentProps) {
  // ...
}
```

### Manejo de Estado
- Usar Zustand para estado global
- Usar React Query para datos del servidor
- Usar useState para estado local

## 🔐 Autenticación

El sistema utiliza JWT para autenticación:

1. El usuario inicia sesión con email y contraseña
2. El servidor devuelve un token JWT
3. El token se almacena en localStorage (persistido con Zustand)
4. Los interceptores de Axios añaden el token a cada request
5. El token se refresca automáticamente cuando expira

## 📊 Estado Global

### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
```

### Course Store
```typescript
interface CourseEditorState {
  currentCourse: Course | null;
  selectedSection: Section | null;
  selectedLesson: Lesson | null;
  hasUnsavedChanges: boolean;
  // ...
}
```

### UI Store
```typescript
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  toasts: Toast[];
  // ...
}
```

## 🎨 Sistema de Diseño

### Colores
- **Primary**: Azul (#3b82f6)
- **Secondary**: Verde (#10b981)
- **Destructive**: Rojo (#ef4444)
- **Background**: Blanco/Negro según tema

### Tipografía
- **Font Family**: Inter
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px)

### Espaciado
- Basado en sistema de 4px (0.25rem)
- Espaciados: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px)

## 🔌 API Endpoints

### Auth
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token

### Courses
- `GET /courses` - Listar cursos
- `GET /courses/:id` - Obtener curso
- `POST /courses` - Crear curso
- `PUT /courses/:id` - Actualizar curso
- `DELETE /courses/:id` - Eliminar curso
- `POST /courses/:id/publish` - Publicar curso
- `POST /courses/:id/unpublish` - Despublicar curso

### Students
- `GET /students` - Listar estudiantes
- `GET /students/:id` - Obtener estudiante
- `PUT /students/:id` - Actualizar estudiante
- `DELETE /students/:id` - Eliminar estudiante
- `POST /students/import` - Importar estudiantes

## 📱 Responsive Design

La aplicación es completamente responsive:

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage
```

## 📦 Despliegue

### Construcción
```bash
npm run build
```

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=EduPlatform
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte, envía un email a soporte@eduplatform.com o abre un issue en GitHub.
