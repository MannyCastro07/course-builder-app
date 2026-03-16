# 📚 PLAN COMPLETO: APLICACIÓN DE CREACIÓN DE CURSOS
## Réplica tipo LearnWorlds - Especificación Técnica Completa

---

## 📋 RESUMEN EJECUTIVO

Este documento contiene la especificación completa para desarrollar una aplicación de creación de cursos online similar a LearnWorlds, con todas las funcionalidades necesarias para que instructores y administradores puedan crear, gestionar y vender cursos online.

### Alcance del Proyecto
- **Dashboard administrativo** con métricas en tiempo real
- **Sistema completo de gestión de cursos** (CRUD)
- **Constructor visual de contenido** con editor drag-and-drop
- **Gestión de estudiantes** con seguimiento de progreso
- **Sistema de autenticación** multi-rol (admin, instructor, estudiante)
- **Gestión de contenido multimedia** con procesamiento de video
- **Configuración de precios** y modelos de acceso
- **Herramientas de marketing** (cupones, afiliados)
- **Sistema de reportes** y analíticas
- **Personalización de marca** (white-label)

---

## 🎯 1. REQUISITOS FUNCIONALES

### 1.1 Dashboard de Autor/Administrador

#### Métricas Clave (KPIs)
| Métrica | Descripción | Frecuencia |
|---------|-------------|------------|
| Ingresos Totales | Suma de todas las ventas | Tiempo real |
| Ingresos del Mes | Ventas acumuladas del mes | Tiempo real |
| Total de Estudiantes | Usuarios registrados | Tiempo real |
| Estudiantes Activos | Actividad últimos 30 días | Diaria |
| Tasa de Finalización | % estudiantes que completan | Diaria |
| Cursos Publicados | Cursos activos | Tiempo real |

#### Widgets del Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  RESUMEN EJECUTIVO                                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│  $12,450        │  1,234          │  89%                    │
│  Ingresos Hoy   │  Estudiantes    │  Tasa de Satisfacción   │
├─────────────────┴─────────────────┴─────────────────────────┤
│  GRÁFICO DE INGRESOS (últimos 30 días)                     │
├─────────────────────────────┬───────────────────────────────┤
│  CURSOS MÁS POPULARES       │  ACTIVIDAD RECIENTE           │
│  1. Curso de Marketing      │  • Juan compró "Diseño UX"    │
│  2. Programación Python     │  • María completó Módulo 3    │
│  3. Diseño Gráfico          │  • Pedro se registró          │
└─────────────────────────────┴───────────────────────────────┘
```

### 1.2 Sistema de Gestión de Cursos (CRUD)

#### Estructura de Curso
```
CURSO
├── Información General
│   ├── Título, descripción, imagen
│   ├── Configuración de acceso
│   └── SEO y metadatos
├──
├── MÓDULOS (Secciones)
│   ├── Módulo 1: Introducción
│   │   ├── Lección 1.1: Bienvenida
│   │   ├── Lección 1.2: Objetivos
│   │   └── Lección 1.3: ¿Qué aprenderás?
│   ├──
│   └── Módulo N: Conclusión
│
├── Recursos Adicionales
│   ├── Material descargable
│   └── Bibliografía
│
└── Configuración Avanzada
    ├── Prerrequisitos
    └── Progresión secuencial
```

#### Estados del Curso
| Estado | Descripción | Visibilidad |
|--------|-------------|-------------|
| Borrador | En desarrollo | Solo autor/admin |
| Revisión | Pendiente de aprobación | Solo autor/admin |
| Publicado | Activo y disponible | Público |
| Privado | Acceso restringido | Solo invitados |
| Archivado | Inactivo | Solo admin |

### 1.3 Constructor de Contenido

#### Tipos de Contenido Soportados
- **Video**: Con subtítulos, transcripciones, controles
- **Texto**: Editor WYSIWYG con formato enriquecido
- **Quiz**: Preguntas de opción múltiple, verdadero/falso, abiertas
- **Archivos**: PDFs, documentos descargables
- **Código**: Bloques de código con syntax highlighting
- **SCORM**: Contenido interoperable

#### Editor Visual
- Interfaz drag-and-drop intuitiva
- Organización de módulos y lecciones
- Preview en tiempo real
- Responsive design checker

### 1.4 Gestión de Estudiantes

#### Funcionalidades
- Perfiles de estudiantes completos
- Seguimiento de progreso por curso
- Inscripciones manuales y automáticas
- Segmentación por grupos
- Exportación de datos

### 1.5 Configuración de Precios y Acceso

#### Modelos de Precios
| Tipo | Descripción |
|------|-------------|
| Gratis | Acceso libre a todos los usuarios registrados |
| Pago único | Precio fijo por curso |
| Suscripción | Acceso por período (mensual/anual) |
| Membresía | Acceso a catálogo completo |
| Cuotas | Pago fraccionado |
| Privado | Solo acceso por invitación |

#### Cupones y Descuentos
- Cupones de porcentaje o monto fijo
- Fechas de validez
- Límite de usos
- Aplicación por curso o global

### 1.6 Herramientas de Marketing

#### Programa de Afiliados
- Generación de links de referido
- Tracking de conversiones
- Comisiones configurables
- Panel de afiliados

#### Embudos de Venta
- Landing pages
- Formularios de captación
- Email marketing integrado
- Automatizaciones

### 1.7 Reportes y Análisis

#### Métricas Disponibles
- Ingresos por período
- Estudiantes registrados
- Tasa de finalización
- Cursos más populares
- Engagement por lección
- Rendimiento de ventas

---

## 🏗️ 2. ARQUITECTURA TÉCNICA

### 2.1 Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14 + TypeScript | SSR/SSG, SEO, rendimiento óptimo |
| **Backend** | NestJS + TypeScript | Arquitectura modular, escalable |
| **Base de Datos** | PostgreSQL 16 | ACID, JSON support, full-text search |
| **Cache** | Redis Cluster | Sesiones, rate limiting, pub/sub |
| **Búsqueda** | Elasticsearch | Full-text search avanzada |
| **Video** | Mux / AWS Elemental | Transcodificación HLS automática |
| **Infraestructura** | Kubernetes (EKS) | Auto-scaling, alta disponibilidad |

### 2.2 Arquitectura de Sistema (5 Capas)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ Web App │  │ Mobile  │  │ Admin   │  │ Third-party     │ │
│  │(Next.js)│  │  App    │  │ Panel   │  │    Apps         │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
└───────┼────────────┼────────────┼────────────────┼──────────┘
        │            │            │                │
        └────────────┴────────────┴────────────────┘
                          │
                   ┌──────▼──────┐
                   │     CDN     │
                   │(CloudFront) │
                   └──────┬──────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      GATEWAY LAYER                           │
│              AWS Application Load Balancer                   │
│                          │                                   │
│                   API Gateway (Kong/AWS)                     │
│         • Rate Limiting • Authentication • Routing           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    APPLICATION LAYER                         │
│              Kubernetes Cluster (EKS)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ API Pods│  │ API Pods│  │ Worker  │  │   WebSocket     │ │
│  │(NestJS) │  │(NestJS) │  │  Pods   │  │   (Socket.io)   │ │
│  │HPA:3-20 │  │HPA:3-20 │  │HPA:2-10 │  │    HPA:2-8      │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │PostgreSQL│  │  Redis   │  │Elasticsearch│ │ ClickHouse  │ │
│  │(Primary) │  │(Cluster) │  │  (Cluster)  │ │(Analytics)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────────┐ │
│  │ S3/R2  │  │  Mux   │  │ Stripe │  │  SendGrid/AWS SES  │ │
│  │Storage │  │ Video  │  │Payments│  │      Email         │ │
│  └────────┘  └────────┘  └────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Base de Datos - Entidades Principales

#### Tablas Core
```sql
-- Usuarios y Autenticación
users (id, email, password_hash, role, status, created_at)
profiles (user_id, first_name, last_name, avatar, bio)
oauth_accounts (id, user_id, provider, provider_account_id)

-- Cursos y Contenido
courses (id, title, description, instructor_id, status, price, currency)
sections (id, course_id, title, position, created_at)
lessons (id, section_id, title, content_type, content, position)
videos (id, lesson_id, url, duration, thumbnail, transcript)

-- Inscripciones y Progreso
enrollments (id, user_id, course_id, status, enrolled_at, completed_at)
lesson_progress (id, enrollment_id, lesson_id, status, progress_percent)

-- Pagos
payments (id, user_id, course_id, amount, currency, status, payment_method)
subscriptions (id, user_id, plan_id, status, start_date, end_date)

-- Evaluaciones
assessments (id, lesson_id, type, title, passing_score)
questions (id, assessment_id, type, content, options, correct_answer)
quiz_attempts (id, user_id, assessment_id, score, answers, submitted_at)

-- Certificados
certificates (id, user_id, course_id, issued_at, certificate_number)
certificate_templates (id, name, template_html, design_settings)
```

### 2.4 APIs Principales

#### Autenticación
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/social/:provider
```

#### Cursos
```
GET    /api/courses                    # Listar cursos
POST   /api/courses                    # Crear curso
GET    /api/courses/:id                # Obtener curso
PUT    /api/courses/:id                # Actualizar curso
DELETE /api/courses/:id                # Eliminar curso
POST   /api/courses/:id/duplicate      # Duplicar curso
POST   /api/courses/:id/publish        # Publicar curso
POST   /api/courses/:id/unpublish      # Despublicar curso
```

#### Contenido
```
GET    /api/courses/:id/sections
POST   /api/courses/:id/sections
PUT    /api/sections/:id
DELETE /api/sections/:id
POST   /api/sections/:id/reorder

GET    /api/sections/:id/lessons
POST   /api/sections/:id/lessons
PUT    /api/lessons/:id
DELETE /api/lessons/:id
POST   /api/lessons/:id/reorder
```

#### Estudiantes
```
GET    /api/students                   # Listar estudiantes
GET    /api/students/:id               # Perfil del estudiante
GET    /api/students/:id/progress      # Progreso del estudiante
POST   /api/students/:id/enroll        # Inscribir a curso
POST   /api/students/:id/unenroll      # Desinscribir
```

#### Pagos
```
POST   /api/payments/checkout          # Crear sesión de pago
GET    /api/payments/history           # Historial de pagos
POST   /api/payments/webhook           # Webhook de Stripe
```

---

## 🎨 3. DISEÑO UI/UX

### 3.1 Sistema de Diseño

#### Paleta de Colores
```css
/* Primary Colors */
--primary-50: #eff6ff;   --primary-500: #3b82f6;  --primary-900: #1e3a8a;
--primary-100: #dbeafe;  --primary-600: #2563eb;
--primary-200: #bfdbfe;  --primary-700: #1d4ed8;
--primary-300: #93c5fd;  --primary-800: #1e40af;
--primary-400: #60a5fa;

/* Semantic Colors */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #0ea5e9;

/* Neutral Colors */
--neutral-0: #ffffff;    --neutral-500: #64748b;   --neutral-900: #0f172a;
--neutral-50: #f8fafc;   --neutral-600: #475569;
--neutral-100: #f1f5f9;  --neutral-700: #334155;
--neutral-200: #e2e8f0;  --neutral-800: #1e293b;
```

#### Tipografía
- **Font Principal**: Inter (sans-serif)
- **Font Monospace**: JetBrains Mono
- **Escala**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px

#### Espaciado
```css
--space-1: 0.25rem;   --space-6: 1.5rem;
--space-2: 0.5rem;    --space-8: 2rem;
--space-3: 0.75rem;   --space-10: 2.5rem;
--space-4: 1rem;      --space-12: 3rem;
--space-5: 1.25rem;   --space-16: 4rem;
```

### 3.2 Layout del Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📚 CourseForge    │  🔍 Search...    🔔  👤 Profile   │  ← Header (72px)
│  ──────────────────┼────────────────────────────────────│
│  📊 Dashboard      │                                     │
│  📚 My Courses     │    [Widgets de Métricas]           │
│  👥 Students       │    ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐ │  ← Sidebar
│  📈 Analytics      │    │ 2.8k│ │ 18  │ │$12k │ │ 78%│ │    (280px)
│  💬 Messages       │    └─────┘ └─────┘ └─────┘ └────┘ │
│  ⚙️ Settings       │                                     │
│  ──────────────────│    [Gráficos y Contenido]          │  ← Content Area
│  ❓ Help           │                                     │
│  🚪 Logout         │                                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Componentes Principales

#### Navegación
- **Sidebar**: Navegación principal, colapsable a 72px
- **Header**: Búsqueda, notificaciones, perfil de usuario
- **Breadcrumbs**: Navegación jerárquica
- **Tabs**: Navegación por secciones

#### Data Display
- **Stat Cards**: Métricas con tendencias
- **Data Tables**: Tablas con ordenamiento, filtros, paginación
- **Charts**: Gráficos de líneas, barras, pastel, áreas
- **Progress Bars**: Indicadores de progreso

#### Formularios
- **Inputs**: Texto, número, email, contraseña
- **Selects**: Dropdowns con búsqueda
- **Textareas**: Campos de texto largo
- **File Uploaders**: Drag & drop con preview
- **Toggles**: Switches on/off
- **Date Pickers**: Selección de fechas

#### Feedback
- **Toast Notifications**: Mensajes temporales
- **Modals**: Diálogos de confirmación
- **Alerts**: Mensajes de error/éxito/advertencia
- **Skeleton Loaders**: Estados de carga
- **Empty States**: Pantallas sin contenido

### 3.4 Pantallas Principales

#### Dashboard
- Widgets de métricas clave
- Gráficos de tendencias
- Accesos rápidos
- Actividad reciente

#### Lista de Cursos
- Vista grid/lista
- Filtros avanzados
- Badges de estado
- Acciones por curso
- Paginación

#### Editor de Curso
- Layout de 3 columnas:
  - **Izquierda**: Estructura del curso (módulos/lecciones)
  - **Centro**: Canvas de edición
  - **Derecha**: Biblioteca de bloques

#### Gestión de Estudiantes
- Tabla con información completa
- Filtros por curso y estado
- Indicadores de progreso
- Acciones masivas
- Exportación de datos

#### Reportes
- Múltiples vistas de análisis
- Filtros de fecha
- Gráficos interactivos
- Exportación a CSV/PDF

---

## 💻 4. IMPLEMENTACIÓN FRONTEND

### 4.1 Estructura del Proyecto

```
course-platform/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dialog.tsx
│   │   │   └── ...
│   │   ├── common/          # Componentes reutilizables
│   │   │   ├── DataTable.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── Progress.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── charts/          # Componentes de gráficos
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── AreaChart.tsx
│   │   └── editor/          # Componentes del editor
│   │       ├── CourseEditor.tsx
│   │       ├── SectionList.tsx
│   │       ├── LessonList.tsx
│   │       └── ContentBlocks.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Courses.tsx
│   │   ├── CourseEditor.tsx
│   │   ├── Students.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCourses.ts
│   │   ├── useStudents.ts
│   │   └── useDebounce.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── courseStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   └── studentService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### 4.2 Stack Tecnológico Frontend

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Estilos** | Tailwind CSS |
| **UI Components** | Radix UI + shadcn/ui |
| **Estado Global** | Zustand |
| **Datos del Servidor** | TanStack Query |
| **Formularios** | React Hook Form + Zod |
| **Gráficos** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **Editor** | TipTap |
| **HTTP Client** | Axios |

### 4.3 Ejemplo de Componente: StatCard

```tsx
// components/common/StatCard.tsx
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs mes anterior',
  icon,
  trend = 'neutral',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-red-600',
                  trend === 'neutral' && 'text-gray-600'
                )}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Ejemplo de Hook: useCourses

```tsx
// hooks/useCourses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { Course, CreateCourseInput } from '@/types';

export function useCourses() {
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      courseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
}
```

---

## 🔧 5. IMPLEMENTACIÓN BACKEND

### 5.1 Estructura del Proyecto Backend

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── roles.guard.ts
│   │   ├── courses/
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── courses.module.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   ├── enrollments/
│   │   ├── payments/
│   │   ├── media/
│   │   └── notifications/
│   ├── shared/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── utils/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── redis/
│   │   └── queue/
│   └── main.ts
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 5.2 Ejemplo de Servicio: CoursesService

```typescript
// modules/courses/courses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(options: PaginationOptions): Promise<PaginatedResult<Course>> {
    const [courses, total] = await this.courseRepository.findAndCount({
      relations: ['instructor', 'sections', 'enrollments'],
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: courses,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'sections', 'sections.lessons', 'enrollments'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async create(createDto: CreateCourseDto, instructorId: string): Promise<Course> {
    const course = this.courseRepository.create({
      ...createDto,
      instructorId,
      status: 'draft',
    });

    return this.courseRepository.save(course);
  }

  async update(id: string, updateDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async publish(id: string): Promise<Course> {
    return this.update(id, { status: 'published', publishedAt: new Date() });
  }

  async duplicate(id: string, instructorId: string): Promise<Course> {
    const original = await this.findOne(id);
    const { id: _, createdAt, updatedAt, ...courseData } = original;

    const duplicate = this.courseRepository.create({
      ...courseData,
      title: `${original.title} (Copy)`,
      instructorId,
      status: 'draft',
    });

    return this.courseRepository.save(duplicate);
  }
}
```

### 5.3 Autenticación JWT

```typescript
// modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

---

## 📊 6. MODELOS DE DATOS

### 6.1 Entidades Principales

```typescript
// types/index.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage?: string;
  introVideo?: string;
  instructorId: string;
  instructor?: User;
  status: 'draft' | 'published' | 'archived' | 'private';
  price: number;
  currency: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  sections: Section[];
  enrollmentsCount?: number;
  rating?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  position: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  contentType: 'video' | 'text' | 'quiz' | 'file' | 'code';
  content: string;
  video?: Video;
  duration?: number;
  isPreview: boolean;
  position: number;
  resources?: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  lessonId: string;
  url: string;
  thumbnail?: string;
  duration: number;
  transcript?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal';
  transactionId: string;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usesCount: number;
  validFrom: Date;
  validUntil?: Date;
  applicableCourses?: string[];
  isActive: boolean;
}
```

---

## 🚀 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Fases del Proyecto

#### Fase 1: Fundamentos (Semanas 1-3)
- [ ] Setup de proyecto frontend y backend
- [ ] Configuración de base de datos
- [ ] Sistema de autenticación básico
- [ ] Layout principal del dashboard

#### Fase 2: Gestión de Cursos (Semanas 4-6)
- [ ] CRUD de cursos
- [ ] Gestión de secciones y lecciones
- [ ] Editor de contenido básico
- [ ] Subida de archivos multimedia

#### Fase 3: Contenido y Media (Semanas 7-8)
- [ ] Procesamiento de video
- [ ] Editor WYSIWYG
- [ ] Sistema de archivos
- [ ] Preview de cursos

#### Fase 4: Estudiantes y Progreso (Semanas 9-10)
- [ ] Gestión de estudiantes
- [ ] Sistema de inscripciones
- [ ] Tracking de progreso
- [ ] Perfiles de usuario

#### Fase 5: Pagos (Semanas 11-12)
- [ ] Integración con Stripe
- [ ] Configuración de precios
- [ ] Cupones y descuentos
- [ ] Historial de pagos

#### Fase 6: Marketing (Semanas 13-14)
- [ ] Programa de afiliados
- [ ] Landing pages
- [ ] Email marketing
- [ ] Formularios de captación

#### Fase 7: Reportes (Semanas 15-16)
- [ ] Dashboard de analytics
- [ ] Reportes de ingresos
- [ ] Reportes de estudiantes
- [ ] Exportación de datos

#### Fase 8: Polish y Lanzamiento (Semanas 17-18)
- [ ] Testing completo
- [ ] Optimización de rendimiento
- [ ] Documentación
- [ ] Despliegue a producción

### 7.2 Estimación de Recursos

| Rol | Cantidad | Duración |
|-----|----------|----------|
| Tech Lead | 1 | 18 semanas |
| Frontend Senior | 2 | 18 semanas |
| Backend Senior | 2 | 18 semanas |
| UI/UX Designer | 1 | 8 semanas |
| DevOps | 1 | 6 semanas |
| QA Engineer | 1 | 8 semanas |

### 7.3 Costo Estimado de Infraestructura (Mensual)

| Servicio | Costo Estimado |
|----------|----------------|
| AWS EKS (Kubernetes) | $400 - $800 |
| RDS PostgreSQL | $200 - $500 |
| ElastiCache Redis | $100 - $200 |
| S3 Storage | $50 - $200 |
| CloudFront CDN | $100 - $300 |
| Mux Video | $200 - $500 |
| Elasticsearch | $300 - $600 |
| **Total** | **$1,350 - $3,100** |

---

## 📁 8. ARCHIVOS GENERADOS

### Documentación Completa
| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Requisitos Funcionales | `/mnt/okcomputer/output/requisitos_funcionales_lms_learnworlds.md` | Análisis funcional detallado |
| Arquitectura Técnica | `/mnt/okcomputer/output/arquitectura-elearning-platform.md` | Arquitectura completa |
| Diseño UI/UX | `/mnt/okcomputer/output/course-platform-ui-design.html` | Sistema de diseño |
| Frontend Codebase | `/mnt/okcomputer/output/course-platform/` | Código fuente React |
| Diagrama DB | `/mnt/okcomputer/output/db-schema-diagram.png` | Esquema de base de datos |
| Diagrama Sistema | `/mnt/okcomputer/output/system-architecture-diagram.png` | Arquitectura de sistema |

---

## ✅ 9. CHECKLIST DE FUNCIONALIDADES

### Core Features
- [x] Dashboard con métricas
- [x] CRUD de cursos completo
- [x] Editor visual drag-and-drop
- [x] Gestión de secciones y lecciones
- [x] Soporte multimedia (video, PDF, audio)
- [x] Gestión de estudiantes
- [x] Sistema de inscripciones
- [x] Tracking de progreso
- [x] Autenticación JWT
- [x] Autorización RBAC

### Monetización
- [x] Configuración de precios
- [x] Múltiples modelos de acceso
- [x] Sistema de cupones
- [x] Integración de pagos (Stripe)
- [x] Reportes de ventas

### Marketing
- [x] Programa de afiliados
- [x] Landing pages
- [x] Email marketing
- [x] Embudos de venta

### Avanzado
- [x] Procesamiento de video
- [x] Editor WYSIWYG
- [x] Sistema de quizzes
- [x] Certificados
- [x] White-label
- [x] API para integraciones
- [x] Webhooks

---

## 🎯 CONCLUSIÓN

Este plan proporciona una hoja de ruta completa para desarrollar una aplicación de creación de cursos comparable a LearnWorlds. El proyecto está dividido en componentes manejables con especificaciones técnicas detalladas para cada capa.

### Próximos Pasos Recomendados
1. Revisar y aprobar el plan con stakeholders
2. Configurar repositorios y ambientes de desarrollo
3. Comenzar con la Fase 1 (Fundamentos)
4. Establecer sprints de 2 semanas
5. Revisar progreso semanalmente

### Contacto y Soporte
Para dudas o aclaraciones sobre este plan, consultar la documentación detallada en los archivos generados.

---

**Documento generado:** 17 de Marzo, 2026  
**Versión:** 1.0  
**Estado:** Completo
