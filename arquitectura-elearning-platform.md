# Arquitectura Técnica: Plataforma de E-Learning tipo LearnWorlds

## Índice
1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Arquitectura de Sistema](#2-arquitectura-de-sistema)
3. [Diseño de Base de Datos](#3-diseño-de-base-de-datos)
4. [Estructura de APIs](#4-estructura-de-apis)
5. [Autenticación y Autorización](#5-autenticación-y-autorización)
6. [Escalabilidad y Rendimiento](#6-escalabilidad-y-rendimiento)
7. [Estrategia de Despliegue](#7-estrategia-de-despliegue)

---

## 1. Stack Tecnológico

### 1.1 Frontend

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Framework** | Next.js 14 (App Router) | SSR/SSG para SEO, rendimiento óptimo, API routes integradas |
| **Lenguaje** | TypeScript | Tipado fuerte, mejor mantenibilidad, menos errores en producción |
| **Estilos** | Tailwind CSS + shadcn/ui | Desarrollo rápido, diseño consistente, componentes accesibles |
| **Estado** | Zustand + React Query | Estado global ligero, caching eficiente de datos del servidor |
| **Video Player** | Video.js / Plyr | Soporte HLS/DASH, subtítulos, controles personalizables |
| **Editor** | TipTap / Slate.js | Editor WYSIWYG rico para contenido de cursos |
| **Charts** | Recharts / Tremor | Visualización de analytics del instructor |

### 1.2 Backend

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **API** | NestJS | Arquitectura modular, inyección de dependencias, excelente para APIs escalables |
| **Lenguaje** | TypeScript | Consistencia con frontend, tipado en toda la stack |
| **Validación** | Zod / class-validator | Validación robusta de inputs |
| **Documentación** | Swagger/OpenAPI | Documentación automática de APIs |
| **Queue** | BullMQ (Redis) | Procesamiento asíncrono de tareas pesadas |
| **WebSockets** | Socket.io | Tiempo real para notificaciones y chat |

### 1.3 Base de Datos

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Principal** | PostgreSQL 16 | ACID compliance, JSON support, full-text search, escalable |
| **Cache** | Redis 7 | Sesiones, rate limiting, cache de queries frecuentes |
| **Búsqueda** | Elasticsearch | Búsqueda full-text avanzada de cursos y contenido |
| **Analytics** | ClickHouse (opcional) | Queries analíticas de alto rendimiento |

### 1.4 Almacenamiento y Media

| Servicio | Uso |
|----------|-----|
| **AWS S3 / Cloudflare R2** | Almacenamiento de videos, documentos, imágenes |
| **AWS CloudFront / Cloudflare CDN** | Distribución global de contenido estático |
| **AWS Elemental / Mux** | Transcodificación de video, streaming adaptativo |
| **ImageKit / Cloudinary** | Optimización y transformación de imágenes on-the-fly |

### 1.5 Infraestructura

| Componente | Tecnología |
|------------|------------|
| **Contenedores** | Docker + Docker Compose |
| **Orquestación** | Kubernetes (EKS/GKE) |
| **CI/CD** | GitHub Actions |
| **Monitoreo** | Datadog / Grafana + Prometheus |
| **Logs** | ELK Stack / Datadog |
| **Error Tracking** | Sentry |

---

## 2. Arquitectura de Sistema

### 2.1 Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │ Mobile App  │  │  Admin Panel│  │  Third-party Apps   │ │
│  │  (Next.js)  │  │(React Native│  │  (Next.js)  │  │    (API Clients)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          └────────────────┴────────────────┴────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   CDN (CloudFront)  │
                         │  Static + Video     │
                         └──────────┬──────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                           GATEWAY LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AWS Application Load Balancer                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                        API Gateway (Kong/AWS)                          │  │
│  │  • Rate Limiting  • Authentication  • Routing  • Caching              │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Kubernetes Cluster (EKS)                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  API Pods   │  │  API Pods   │  │ Worker Pods │  │ WebSocket   │ │   │
│  │  │  (NestJS)   │  │  (NestJS)   │  │  (BullMQ)   │  │  (Socket.io)│ │   │
│  │  │  HPA: 3-20  │  │  HPA: 3-20  │  │  HPA: 2-10  │  │  HPA: 2-8   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          DATA LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  PostgreSQL   │  │    Redis      │  │ Elasticsearch │  │ ClickHouse  │  │
│  │   (Primary)   │  │   (Cluster)   │  │   (Cluster)   │  │  (Analytics)│  │
│  │  RDS/Aurora   │  │  ElastiCache  │  │  OpenSearch   │  │   (Opt)     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └─────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  S3/R2      │  │    Mux      │  │  Stripe     │  │  SendGrid/AWS SES   ││
│  │  Storage    │  │   Video     │  │  Payments   │  │     Email           ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │ ImageKit/   │  │   Zoom      │  │   OAuth     │  │    Analytics        ││
│  │ Cloudinary  │  │ Integration │  │ Providers   │  │  (Google/FB Pixel)  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Patrones de Arquitectura

| Patrón | Implementación | Propósito |
|--------|----------------|-----------|
| **Microservicios (lightweight)** | Módulos NestJS independientes | Separación de dominios |
| **CQRS** | Comandos separados de queries | Optimización de lectura/escritura |
| **Event Sourcing** | Para progreso y analytics | Audit trail completo |
| **Saga Pattern** | Transacciones distribuidas | Consistencia en operaciones complejas |
| **Circuit Breaker** | Resilience4j/Opossum | Tolerancia a fallos |

### 2.3 Módulos del Sistema (Domain-Driven Design)

```
src/
├── modules/
│   ├── auth/              # Autenticación y autorización
│   ├── users/             # Gestión de usuarios
│   ├── courses/           # Cursos y contenido
│   ├── lessons/           # Lecciones individuales
│   ├── enrollments/       # Inscripciones
│   ├── progress/          # Progreso del estudiante
│   ├── payments/          # Pagos y suscripciones
│   ├── assessments/       # Cuestionarios y exámenes
│   ├── certificates/      # Certificados
│   ├── notifications/     # Notificaciones
│   ├── analytics/         # Métricas y reportes
│   ├── media/             # Gestión de archivos multimedia
│   ├── communities/       # Foros y discusiones
│   └── integrations/      # APIs de terceros
├── shared/                # Utilidades compartidas
├── infrastructure/        # Configuración de infraestructura
└── main.ts
```

---

## 3. Diseño de Base de Datos

### 3.1 Diagrama ER Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTIDADES PRINCIPALES                              │
└─────────────────────────────────────────────────────────────────────────────┘

 USERS (1) ────────────────< (N) ENROLLMENTS >────────────── (1) COURSES
    │                              │                              │
    │                              │                              │
    │                         (N) PROGRESS                        │
    │                              │                              │
    │                              ▼                              │
    │                         (N) LESSONS <───────────────────────┘
    │                                                           │
    │                                                    (N) SECTIONS
    │                                                           │
    │                                                    (N) MODULES
    │                                                           │
    └───────────────────< (N) SUBMISSIONS >─────────────────────┘
                                    │
                                    ▼
                              (N) ASSESSMENTS
                                    │
                              (N) QUESTIONS
                                    │
                              (N) ANSWERS

 USERS (1) ────────────────< (N) CERTIFICATES

 USERS (1) ────────────────< (N) PAYMENTS >────────────────── (N) PLANS

 USERS (1) ────────────────< (N) NOTIFICATIONS

 COURSES (1) ──────────────< (N) REVIEWS >─────────────────── (1) USERS

 COURSES (1) ──────────────< (N) DISCUSSIONS >─────────────── (N) USERS
```

### 3.2 Esquema de Tablas

#### 3.2.1 Usuarios y Autenticación

```sql
-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL para OAuth
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role NOT NULL DEFAULT 'student',
    status user_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- Tipos de rol
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student', 'support');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Tabla de perfiles de instructor
CREATE TABLE instructor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    expertise TEXT[], -- Array de especialidades
    social_links JSONB, -- {linkedin, twitter, website, youtube}
    verification_status verification_status DEFAULT 'pending',
    commission_rate DECIMAL(5,2) DEFAULT 70.00, -- % para el instructor
    total_students INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OAuth accounts
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider oauth_provider NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

CREATE TYPE oauth_provider AS ENUM ('google', 'facebook', 'apple', 'linkedin');
```

#### 3.2.2 Cursos y Contenido

```sql
-- Tabla de cursos
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    short_description VARCHAR(500),
    instructor_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    level course_level DEFAULT 'beginner',
    language VARCHAR(10) DEFAULT 'es',
    status course_status DEFAULT 'draft',
    visibility visibility_type DEFAULT 'public',
    
    -- Pricing
    price DECIMAL(10,2),
    compare_at_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_free BOOLEAN DEFAULT FALSE,
    
    -- Media
    thumbnail_url TEXT,
    preview_video_url TEXT,
    trailer_video_id UUID,
    
    -- Meta
    duration_minutes INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    total_sections INTEGER DEFAULT 0,
    
    -- Settings
    settings JSONB DEFAULT '{
        "enable_discussions": true,
        "enable_reviews": true,
        "completion_certificate": true,
        "drip_content": false,
        "prerequisites": []
    }',
    
    -- SEO
    seo_title VARCHAR(70),
    seo_description VARCHAR(160),
    seo_keywords TEXT[],
    
    -- Stats
    enrollment_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');
CREATE TYPE course_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'unlisted');

-- Secciones de curso
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lecciones
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type lesson_type NOT NULL DEFAULT 'video',
    
    -- Contenido según tipo
    content JSONB, -- Estructura flexible según tipo
    
    -- Video específico
    video_id UUID REFERENCES videos(id),
    duration_seconds INTEGER DEFAULT 0,
    
    -- Configuración
    is_free_preview BOOLEAN DEFAULT FALSE,
    is_downloadable BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INTEGER NOT NULL,
    
    -- Recursos adjuntos
    resources JSONB[], -- Array de {title, url, type}
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE lesson_type AS ENUM (
    'video', 'text', 'quiz', 'assignment', 'live_session', 
    'download', 'survey', 'interactive'
);

-- Videos (gestión separada para transcodificación)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255),
    original_url TEXT, -- URL en S3
    
    -- Transcodificación
    status video_status DEFAULT 'uploading',
    processing_job_id VARCHAR(255), -- ID del job en Mux/AWS
    
    -- URLs de reproducción (HLS/DASH)
    playback_url TEXT, -- HLS master playlist
    dash_url TEXT,
    
    -- Qualities disponibles
    qualities JSONB[], -- [{quality: '1080p', url: '...'}, ...]
    
    -- Thumbnails
    thumbnail_url TEXT,
    poster_url TEXT,
    
    -- Metadata
    duration_seconds INTEGER,
    resolution VARCHAR(20), -- "1920x1080"
    file_size_bytes BIGINT,
    
    -- Subtítulos
    subtitles JSONB[], -- [{language, url, label}]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE video_status AS ENUM ('uploading', 'processing', 'ready', 'error', 'deleted');

-- Categorías y tags
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE course_tags (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (course_id, tag)
);
```

#### 3.2.3 Inscripciones y Progreso

```sql
-- Inscripciones
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Tipo de acceso
    access_type access_type NOT NULL DEFAULT 'purchase',
    
    -- Si es compra
    payment_id UUID REFERENCES payments(id),
    price_paid DECIMAL(10,2),
    
    -- Si es suscripción
    subscription_id UUID,
    
    -- Progreso
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER NOT NULL,
    
    -- Fechas importantes
    enrolled_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- NULL = lifetime
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    
    -- Certificado
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id UUID,
    
    UNIQUE(user_id, course_id)
);

CREATE TYPE access_type AS ENUM ('purchase', 'subscription', 'gift', 'manual', 'trial');

-- Progreso detallado por lección
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Estado
    status progress_status DEFAULT 'not_started',
    
    -- Para videos
    video_progress_seconds INTEGER DEFAULT 0,
    video_duration_seconds INTEGER,
    video_watched_percent DECIMAL(5,2) DEFAULT 0.00,
    
    -- Para quizzes
    quiz_attempts INTEGER DEFAULT 0,
    quiz_best_score DECIMAL(5,2),
    quiz_passed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'locked');

-- Eventos de progreso (para analytics)
CREATE TABLE progress_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    event_type event_type NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TYPE event_type AS ENUM (
    'video_play', 'video_pause', 'video_complete', 'video_seek',
    'lesson_start', 'lesson_complete', 'quiz_start', 'quiz_submit'
);
```

#### 3.2.4 Evaluaciones

```sql
-- Cuestionarios y exámenes
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_type assessment_type NOT NULL DEFAULT 'quiz',
    
    -- Configuración
    settings JSONB DEFAULT '{
        "time_limit_minutes": null,
        "max_attempts": null,
        "passing_score": 70,
        "shuffle_questions": true,
        "shuffle_answers": true,
        "show_correct_answers": true,
        "show_explanation": true
    }',
    
    -- Puntuación
    total_points INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE assessment_type AS ENUM ('quiz', 'exam', 'survey', 'assignment');

-- Preguntas
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    explanation TEXT,
    points INTEGER DEFAULT 1,
    sort_order INTEGER NOT NULL,
    
    -- Opciones para preguntas de opción múltiple
    options JSONB, -- [{id, text, is_correct}]
    
    -- Para preguntas abiertas
    correct_answer TEXT,
    
    -- Para matching/ordering
    pairs JSONB
);

CREATE TYPE question_type AS ENUM (
    'multiple_choice', 'multiple_select', 'true_false',
    'short_answer', 'essay', 'matching', 'ordering', 'fill_blank'
);

-- Intentos de examen
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    assessment_id UUID REFERENCES assessments(id),
    enrollment_id UUID REFERENCES enrollments(id),
    
    started_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    time_spent_seconds INTEGER,
    
    score DECIMAL(5,2),
    points_earned INTEGER,
    total_points INTEGER,
    passed BOOLEAN,
    
    answers JSONB, -- {question_id: {selected_options, text_answer}}
    
    ip_address INET,
    user_agent TEXT
);
```

#### 3.2.5 Pagos

```sql
-- Tabla de planes/suscripciones
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    plan_type plan_type NOT NULL DEFAULT 'one_time',
    
    -- Precios
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Para suscripciones
    billing_interval interval_type, -- month, year
    trial_days INTEGER DEFAULT 0,
    
    -- Features incluidas
    features JSONB DEFAULT '{
        "max_courses": null,
        "storage_gb": 10,
        "support_level": "email",
        "custom_branding": false,
        "api_access": false
    }',
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

CREATE TYPE plan_type AS ENUM ('one_time', 'subscription', 'usage_based');
CREATE TYPE interval_type AS ENUM ('day', 'week', 'month', 'year');

-- Pagos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Referencias
    course_id UUID REFERENCES courses(id),
    plan_id UUID REFERENCES plans(id),
    
    -- Montos
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10,2) DEFAULT 0,
    instructor_payout DECIMAL(10,2),
    
    -- Método de pago
    payment_method payment_method NOT NULL,
    payment_provider VARCHAR(50) DEFAULT 'stripe',
    provider_payment_id VARCHAR(255),
    
    -- Estado
    status payment_status DEFAULT 'pending',
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'crypto');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');

-- Suscripciones activas
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan_id UUID REFERENCES plans(id),
    
    provider_subscription_id VARCHAR(255),
    
    status subscription_status DEFAULT 'active',
    
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'paused');
```

#### 3.2.6 Certificados

```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    
    -- Datos del certificado
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    template_id UUID REFERENCES certificate_templates(id),
    
    -- Contenido generado
    pdf_url TEXT,
    verification_url TEXT,
    
    -- Datos en el momento de emisión
    student_name VARCHAR(255),
    course_name VARCHAR(255),
    instructor_name VARCHAR(255),
    completion_date DATE,
    
    issued_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    revoked_reason TEXT
);

-- Plantillas de certificado
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    
    -- Diseño
    background_url TEXT,
    layout JSONB, -- Posiciones de textos, logos, etc.
    
    -- Campos dinámicos
    available_fields TEXT[],
    
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 3.3 Índices de Rendimiento

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_courses_status_published ON courses(status, published_at) WHERE status = 'published';
CREATE INDEX idx_courses_instructor ON courses(instructor_id) WHERE status = 'published';
CREATE INDEX idx_courses_category ON courses(category_id) WHERE status = 'published';
CREATE INDEX idx_courses_rating ON courses(rating_average DESC) WHERE status = 'published';

-- Búsqueda full-text
CREATE INDEX idx_courses_search ON courses USING gin(to_tsvector('spanish', title || ' ' || COALESCE(description, '')));

-- Enrollments
CREATE INDEX idx_enrollments_user ON enrollments(user_id, enrolled_at DESC);
CREATE INDEX idx_enrollments_course ON enrollments(course_id, enrolled_at DESC);
CREATE INDEX idx_enrollments_progress ON enrollments(user_id, progress_percent) WHERE progress_percent < 100;

-- Progreso
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(enrollment_id, status);

-- Eventos (particionados por mes)
CREATE INDEX idx_progress_events_user ON progress_events(user_id, created_at DESC);
CREATE INDEX idx_progress_events_lesson ON progress_events(lesson_id, created_at DESC);
```

---

## 4. Estructura de APIs

### 4.1 API REST Versionada

```
/api/v1/
├── auth/
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   ├── POST /forgot-password
│   ├── POST /reset-password
│   ├── POST /verify-email
│   └── GET  /oauth/:provider
│
├── users/
│   ├── GET    /me
│   ├── PATCH  /me
│   ├── PUT    /me/avatar
│   ├── GET    /me/enrollments
│   ├── GET    /me/progress
│   ├── GET    /me/certificates
│   ├── GET    /me/payments
│   └── GET    /:id/profile
│
├── courses/
│   ├── GET    /                    # Listar cursos (con filtros)
│   ├── GET    /featured            # Cursos destacados
│   ├── GET    /search              # Búsqueda
│   ├── GET    /categories          # Categorías
│   ├── GET    /:slug               # Detalle de curso
│   ├── GET    /:slug/curriculum    # Programa completo
│   ├── GET    /:slug/reviews       # Reseñas
│   ├── POST   /:slug/enroll        # Inscribirse
│   ├── POST   /:slug/reviews       # Dejar reseña
│   ├── GET    /:slug/related       # Cursos relacionados
│   └── GET    /:slug/preview/:lessonId  # Vista previa
│
├── lessons/
│   ├── GET    /:id                 # Detalle de lección
│   ├── GET    /:id/content         # Contenido (requiere inscripción)
│   ├── POST   /:id/progress        # Actualizar progreso
│   ├── GET    /:id/resources       # Recursos descargables
│   ├── POST   /:id/complete        # Marcar como completada
│   └── GET    /:id/next            # Siguiente lección
│
├── assessments/
│   ├── GET    /:id                 # Detalle del assessment
│   ├── POST   /:id/start           # Iniciar intento
│   ├── POST   /:id/submit          # Enviar respuestas
│   ├── GET    /:id/results         # Ver resultados
│   └── GET    /attempts/:attemptId # Detalle de intento
│
├── payments/
│   ├── GET    /plans               # Planes disponibles
│   ├── POST   /checkout            # Crear sesión de checkout
│   ├── POST   /webhooks/stripe     # Webhook de Stripe
│   ├── POST   /webhooks/paypal     # Webhook de PayPal
│   └── GET    /history             # Historial de pagos
│
├── certificates/
│   ├── GET    /                    # Mis certificados
│   ├── GET    /:id/download        # Descargar PDF
│   └── GET    /verify/:number      # Verificar autenticidad
│
├── notifications/
│   ├── GET    /                    # Listar notificaciones
│   ├── PATCH  /:id/read            # Marcar como leída
│   ├── PATCH  /read-all            # Marcar todas como leídas
│   └── DELETE /:id                 # Eliminar
│
└── admin/                          # Requiere rol admin
    ├── GET    /dashboard           # Métricas generales
    ├── GET    /users               # Gestión de usuarios
    ├── GET    /courses             # Todos los cursos
    ├── GET    /payments            # Transacciones
    ├── GET    /reports             # Reportes
    └── GET    /settings            # Configuración

/instructor/                        # Requiere rol instructor
├── dashboard/
│   ├── GET    /stats               # Estadísticas del instructor
│   ├── GET    /revenue             # Ingresos
│   └── GET    /students            # Estudiantes
│
├── courses/
│   ├── GET    /                    # Mis cursos
│   ├── POST   /                    # Crear curso
│   ├── GET    /:id                 # Detalle
│   ├── PATCH  /:id                 # Actualizar
│   ├── DELETE /:id                 # Eliminar
│   ├── POST   /:id/publish         # Publicar
│   ├── POST   /:id/duplicate       # Duplicar
│   └── GET    /:id/analytics       # Analytics del curso
│
├── sections/
│   ├── POST   /                    # Crear sección
│   ├── PATCH  /:id                 # Actualizar
│   ├── DELETE /:id                 # Eliminar
│   └── PATCH  /:id/reorder         # Reordenar
│
├── lessons/
│   ├── POST   /                    # Crear lección
│   ├── PATCH  /:id                 # Actualizar
│   ├── DELETE /:id                 # Eliminar
│   ├── PATCH  /:id/reorder         # Reordenar
│   └── POST   /:id/upload-video    # Subir video
│
├── assessments/
│   ├── POST   /                    # Crear assessment
│   ├── GET    /:id                 # Detalle
│   ├── PATCH  /:id                 # Actualizar
│   ├── DELETE /:id                 # Eliminar
│   └── GET    /:id/attempts        # Intentos de estudiantes
│
└── payouts/
    ├── GET    /                    # Historial de pagos
    ├── GET    /pending             # Pagos pendientes
    └── POST   /request             # Solicitar pago
```

### 4.2 API WebSocket (Tiempo Real)

```javascript
// Namespace: /ws

// Eventos del cliente -> servidor
{
  "video:progress": {
    lessonId: string,
    currentTime: number,
    duration: number,
    percent: number
  },
  
  "video:heartbeat": {
    lessonId: string,
    currentTime: number
  },
  
  "notification:subscribe": {},
  
  "chat:join": {
    roomId: string
  },
  
  "chat:message": {
    roomId: string,
    content: string
  }
}

// Eventos del servidor -> cliente
{
  "progress:updated": {
    lessonId: string,
    percent: number,
    completed: boolean
  },
  
  "notification:new": {
    id: string,
    type: string,
    title: string,
    message: string
  },
  
  "chat:message": {
    id: string,
    userId: string,
    userName: string,
    avatar: string,
    content: string,
    timestamp: string
  },
  
  "live:started": {
    lessonId: string,
    streamUrl: string
  },
  
  "certificate:issued": {
    certificateId: string,
    courseName: string
  }
}
```

### 4.3 Estructura de Respuestas

```typescript
// Respuesta estándar
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  links?: {
    self: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

// Respuesta de error
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  stack?: string; // Solo en desarrollo
}

// Ejemplos de códigos de error
enum ErrorCode {
  // 400x - Errores de cliente
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // 500x - Errores de servidor
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

---

## 5. Autenticación y Autorización

### 5.1 Flujo de Autenticación JWT

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Client    │                    │    API      │                    │   Redis     │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                   │                                   │
       │  1. POST /auth/login              │                                   │
       │  {email, password}                │                                   │
       │──────────────────────────────────>│                                   │
       │                                   │                                   │
       │                                   │  2. Verify credentials            │
       │                                   │  3. Generate tokens               │
       │                                   │                                   │
       │                                   │  4. Store refresh token           │
       │                                   │──────────────────────────────────>│
       │                                   │                                   │
       │  5. Return tokens                 │                                   │
       │  {accessToken, refreshToken}      │                                   │
       │<──────────────────────────────────│                                   │
       │                                   │                                   │
       │  6. Request with Authorization    │                                   │
       │  Bearer <accessToken>             │                                   │
       │──────────────────────────────────>│                                   │
       │                                   │                                   │
       │                                   │  7. Verify JWT                    │
       │                                   │  8. Check blacklist               │
       │                                   │──────────────────────────────────>│
       │                                   │                                   │
       │  9. Return data                   │                                   │
       │<──────────────────────────────────│                                   │
       │                                   │                                   │
       │  10. POST /auth/refresh           │                                   │
       │  {refreshToken}                   │                                   │
       │──────────────────────────────────>│                                   │
       │                                   │                                   │
       │                                   │  11. Verify refresh token         │
       │                                   │  12. Rotate tokens                │
       │                                   │                                   │
       │  13. New tokens                   │                                   │
       │<──────────────────────────────────│                                   │
```

### 5.2 Estrategia de Tokens

```typescript
// Access Token (corto tiempo de vida)
interface AccessToken {
  sub: string;        // userId
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;        // 15 minutos
}

// Refresh Token (largo tiempo de vida)
interface RefreshToken {
  sub: string;        // userId
  jti: string;        // tokenId único
  iat: number;
  exp: number;        // 7 días
}

// Configuración
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
    algorithm: 'HS256'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    algorithm: 'HS256'
  }
};
```

### 5.3 Sistema de Autorización RBAC + ABAC

```typescript
// Definición de permisos
enum Permission {
  // Cursos
  COURSE_CREATE = 'course:create',
  COURSE_READ = 'course:read',
  COURSE_UPDATE = 'course:update',
  COURSE_DELETE = 'course:delete',
  COURSE_PUBLISH = 'course:publish',
  
  // Lecciones
  LESSON_CREATE = 'lesson:create',
  LESSON_READ = 'lesson:read',
  LESSON_UPDATE = 'lesson:update',
  LESSON_DELETE = 'lesson:delete',
  
  // Usuarios
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE = 'user:manage',
  
  // Admin
  ADMIN_ACCESS = 'admin:access',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_REPORTS = 'admin:reports'
}

// Roles con permisos
const ROLE_PERMISSIONS = {
  admin: [
    Permission.ADMIN_ACCESS,
    Permission.ADMIN_SETTINGS,
    Permission.ADMIN_REPORTS,
    Permission.USER_MANAGE,
    Permission.COURSE_DELETE,
    Permission.COURSE_PUBLISH
  ],
  instructor: [
    Permission.COURSE_CREATE,
    Permission.COURSE_READ,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
    Permission.LESSON_CREATE,
    Permission.LESSON_READ,
    Permission.LESSON_UPDATE,
    Permission.LESSON_DELETE
  ],
  student: [
    Permission.COURSE_READ,
    Permission.LESSON_READ
  ],
  support: [
    Permission.USER_READ,
    Permission.COURSE_READ
  ]
};

// Decorador de autorización (NestJS)
@Controller('courses')
export class CourseController {
  
  @Post()
  @RequirePermissions(Permission.COURSE_CREATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async create(@Body() dto: CreateCourseDto, @CurrentUser() user: User) {
    // Solo instructores pueden crear cursos
    return this.courseService.create(dto, user.id);
  }
  
  @Patch(':id')
  @RequirePermissions(Permission.COURSE_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard, CourseOwnerGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    // CourseOwnerGuard verifica que el usuario sea dueño del curso (ABAC)
    return this.courseService.update(id, dto);
  }
}
```

### 5.4 Guards de Autorización

```typescript
// Guard para verificar propiedad de recurso
@Injectable()
export class CourseOwnerGuard implements CanActivate {
  constructor(private courseService: CourseService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.id;
    
    // Admin puede editar cualquier curso
    if (user.role === 'admin') return true;
    
    // Verificar propiedad
    const course = await this.courseService.findById(courseId);
    return course.instructorId === user.sub;
  }
}

// Guard para verificar inscripción
@Injectable()
export class EnrollmentGuard implements CanActivate {
  constructor(private enrollmentService: EnrollmentService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.courseId || request.body.courseId;
    
    // Admin e instructores tienen acceso
    if (['admin', 'instructor'].includes(user.role)) return true;
    
    // Verificar inscripción activa
    const enrollment = await this.enrollmentService.findActive(
      user.sub, 
      courseId
    );
    
    if (!enrollment) {
      throw new ForbiddenException('No estás inscrito en este curso');
    }
    
    // Adjuntar inscripción al request para uso posterior
    request.enrollment = enrollment;
    return true;
  }
}
```

---

## 6. Escalabilidad y Rendimiento

### 6.1 Estrategias de Escalado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ESTRATEGIA DE ESCALADO                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   CDN       │
                              │ CloudFront  │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │    WAF      │
                              │  AWS WAF    │
                              └──────┬──────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                                    │                                        │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    Load Balancer (ALB)                                 │  │
│  │              Health checks, SSL termination                            │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    Kubernetes Cluster (EKS)                            │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Horizontal Pod Autoscaler (HPA)                     │  │  │
│  │  │                                                                  │  │  │
│  │  │   API Pods:  min: 3, max: 20, target CPU: 70%                  │  │  │
│  │  │   Worker Pods: min: 2, max: 10, target queue depth: 100        │  │  │
│  │  │   WebSocket Pods: min: 2, max: 8, target connections: 1000     │  │  │
│  │  │                                                                  │  │  │
│  │  │   Scale-up: 30 seconds    Scale-down: 5 minutes                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Cluster Autoscaler                                  │  │  │
│  │  │                                                                  │  │  │
│  │  │   Node groups:                                                   │  │  │
│  │  │   - General: t3.medium, min: 3, max: 20                          │  │  │
│  │  │   - Compute: c5.xlarge, min: 0, max: 10 (para workers)           │  │  │
│  │  │   - Memory: r5.large, min: 0, max: 5 (para cache)                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Caching Strategy

```typescript
// Estrategia de caché multi-capa
const CACHE_STRATEGY = {
  // L1: In-memory (Node.js)
  local: {
    ttl: 60, // 1 minuto
    max: 1000, // items
    enabled: true
  },
  
  // L2: Redis distribuido
  redis: {
    ttl: 300, // 5 minutos
    cluster: true,
    enabled: true
  },
  
  // L3: CDN
  cdn: {
    ttl: 86400, // 24 horas
    enabled: true
  }
};

// Implementación de CacheService
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private redisService: RedisService
  ) {}
  
  async get<T>(key: string): Promise<T | null> {
    // Intentar caché local primero
    const local = await this.getLocal(key);
    if (local) return local;
    
    // Intentar Redis
    const redis = await this.redisService.get(key);
    if (redis) {
      // Poblar caché local
      await this.setLocal(key, redis);
      return redis;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await Promise.all([
      this.setLocal(key, value, ttl),
      this.redisService.set(key, value, ttl)
    ]);
  }
  
  // Cache-aside pattern
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;
    
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
  
  // Invalidación por patrón
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    await this.redisService.del(...keys);
  }
}

// Decorador para caché automática
@Cacheable({
  key: (args) => `course:${args[0]}`,
  ttl: 300,
  invalidateOn: ['course:updated', 'course:deleted']
})
async getCourseById(id: string): Promise<Course> {
  return this.courseRepository.findById(id);
}
```

### 6.3 Optimización de Base de Datos

```sql
-- Particionamiento de tablas grandes
-- Eventos de progreso por mes
CREATE TABLE progress_events_2024_01 PARTITION OF progress_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
CREATE TABLE progress_events_2024_02 PARTITION OF progress_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Tabla de lectura para analytics
CREATE MATERIALIZED VIEW course_analytics AS
SELECT 
    c.id as course_id,
    c.title,
    COUNT(DISTINCT e.user_id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.user_id END) as completions,
    AVG(e.progress_percent) as avg_progress,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as review_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN reviews r ON c.id = r.course_id
WHERE c.status = 'published'
GROUP BY c.id, c.title;

-- Índice para refresco eficiente
CREATE UNIQUE INDEX idx_course_analytics_id ON course_analytics(course_id);

-- Refrescar cada hora
REFRESH MATERIALIZED VIEW CONCURRENTLY course_analytics;

-- Connection pooling con PgBouncer
-- max_connections: 1000
-- default_pool_size: 20
-- reserve_pool_size: 5
```

### 6.4 Manejo de Contenido Multimedia

```typescript
// Servicio de procesamiento de video
@Injectable()
export class VideoProcessingService {
  constructor(
    private muxService: MuxService,
    private s3Service: S3Service,
    private queueService: QueueService
  ) {}
  
  async uploadVideo(file: MulterFile, lessonId: string): Promise<Video> {
    // 1. Subir a S3
    const uploadUrl = await this.s3Service.getPresignedUploadUrl(
      `uploads/${lessonId}/${file.originalname}`
    );
    
    // 2. Crear registro en DB
    const video = await this.videoRepository.create({
      originalFilename: file.originalname,
      originalUrl: uploadUrl,
      status: 'uploading'
    });
    
    // 3. Encolar para procesamiento
    await this.queueService.add('video-processing', {
      videoId: video.id,
      s3Key: `uploads/${lessonId}/${file.originalname}`,
      lessonId
    });
    
    return video;
  }
  
  // Worker de procesamiento
  @Process('video-processing')
  async processVideo(job: Job<VideoProcessingJob>) {
    const { videoId, s3Key } = job.data;
    
    // 1. Crear asset en Mux
    const muxAsset = await this.muxService.createAsset(s3Key);
    
    // 2. Esperar procesamiento
    await this.waitForProcessing(muxAsset.id);
    
    // 3. Actualizar video con URLs
    await this.videoRepository.update(videoId, {
      status: 'ready',
      playbackUrl: muxAsset.playback_url,
      qualities: muxAsset.tracks,
      durationSeconds: muxAsset.duration,
      thumbnailUrl: muxAsset.thumbnail_url
    });
    
    // 4. Notificar al usuario
    await this.notificationService.send(video.instructorId, {
      type: 'video_ready',
      message: 'Tu video ha sido procesado exitosamente'
    });
  }
}

// Configuración de calidades
const VIDEO_QUALITIES = {
  '4k': { width: 3840, height: 2160, bitrate: '15000k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
  '720p': { width: 1280, height: 720, bitrate: '2500k' },
  '480p': { width: 854, height: 480, bitrate: '1000k' },
  '360p': { width: 640, height: 360, bitrate: '500k' }
};
```

### 6.5 Rate Limiting

```typescript
// Configuración de rate limiting
const RATE_LIMITS = {
  // API general
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // requests por ventana
    keyPrefix: 'rl:default'
  },
  
  // Autenticación (más estricto)
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 intentos de login
    keyPrefix: 'rl:auth',
    skipSuccessfulRequests: true
  },
  
  // Video streaming
  streaming: {
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 1 request por segundo
    keyPrefix: 'rl:stream'
  },
  
  // Uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 uploads por hora
    keyPrefix: 'rl:upload'
  }
};

// Implementación con Redis
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redisService: RedisService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    const limit = this.getLimit(context);
    
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      await this.redisService.expire(key, limit.windowMs / 1000);
    }
    
    if (current > limit.max) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    
    return true;
  }
}
```

---

## 7. Estrategia de Despliegue

### 7.1 Pipeline CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit -- --coverage
      
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push API
        run: |
          docker build -t $ECR_REGISTRY/api:$GITHUB_SHA -f Dockerfile.api .
          docker push $ECR_REGISTRY/api:$GITHUB_SHA
      
      - name: Build and push Frontend
        run: |
          docker build -t $ECR_REGISTRY/web:$GITHUB_SHA -f Dockerfile.web .
          docker push $ECR_REGISTRY/web:$GITHUB_SHA

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to EKS Staging
        run: |
          aws eks update-kubeconfig --region us-east-1 --name staging-cluster
          kubectl set image deployment/api api=$ECR_REGISTRY/api:$GITHUB_SHA
          kubectl set image deployment/web web=$ECR_REGISTRY/web:$GITHUB_SHA
          kubectl rollout status deployment/api
          kubectl rollout status deployment/web

  e2e-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: https://staging.elearning-platform.com

  deploy-production:
    needs: e2e-tests
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to EKS Production
        run: |
          aws eks update-kubeconfig --region us-east-1 --name production-cluster
          
          # Blue-green deployment
          kubectl apply -f k8s/production/
          kubectl set image deployment/api-v2 api=$ECR_REGISTRY/api:$GITHUB_SHA
          kubectl rollout status deployment/api-v2
          
          # Switch traffic
          kubectl patch service api -p '{"spec":{"selector":{"version":"v2"}}}'
          
          # Cleanup old version
          kubectl delete deployment api-v1
```

### 7.2 Estructura de Kubernetes

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: elearning-platform

---
# k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  API_PORT: "3000"
  DATABASE_POOL_SIZE: "20"
  REDIS_CLUSTER: "true"
  
---
# k8s/base/secret.yaml (encriptado con Sealed Secrets)
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
spec:
  encryptedData:
    DATABASE_URL: AgByA...
    JWT_SECRET: AgByB...
    STRIPE_SECRET_KEY: AgByC...

---
# k8s/base/deployment-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        version: v1
    spec:
      containers:
        - name: api
          image: ecr.amazonaws.com/api:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5

---
# k8s/base/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60

---
# k8s/base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP

---
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
    - hosts:
        - api.elearning-platform.com
        - app.elearning-platform.com
      secretName: tls-secret
  rules:
    - host: api.elearning-platform.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
    - host: app.elearning-platform.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
```

### 7.3 Monitoreo y Observabilidad

```typescript
// Configuración de métricas con Prometheus
@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsTotal: Counter;
  private readonly activeConnections: Gauge;
  
  constructor() {
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });
    
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });
    
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections'
    });
  }
  
  recordRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }
}

// Middleware de tracing
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const span = tracer.startSpan('http_request', {
      tags: {
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.headers['user-agent']
      }
    });
    
    res.on('finish', () => {
      span.setTag('http.status_code', res.statusCode);
      span.finish();
    });
    
    next();
  }
}

// Health checks
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}
  
  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }
  
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis')
    ]);
  }
}
```

### 7.4 Estrategia de Backup

```yaml
# Backup de base de datos
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # 2 AM diario
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: postgres:16-alpine
              command:
                - /bin/sh
                - -c
                - |
                  pg_dump $DATABASE_URL | gzip > /backup/db-$(date +%Y%m%d).sql.gz
                  aws s3 cp /backup/db-$(date +%Y%m%d).sql.gz s3://backups-elearning/db/
                  # Mantener solo últimos 30 días
                  aws s3 ls s3://backups-elearning/db/ | awk '$1 < "'$(date -d '30 days ago' +%Y-%m-%d)'" {print $4}' | xargs -I {} aws s3 rm s3://backups-elearning/db/{}
              env:
                - name: DATABASE_URL
                  valueFrom:
                    secretKeyRef:
                      name: app-secrets
                      key: DATABASE_URL
          restartPolicy: OnFailure
```

---

## 8. Estimación de Costos (Mensual)

| Servicio | Configuración | Costo Estimado |
|----------|---------------|----------------|
| **EKS Cluster** | 3-20 nodos t3.medium | $200 - $1,500 |
| **RDS PostgreSQL** | db.r5.xlarge, Multi-AZ | $400 - $600 |
| **ElastiCache Redis** | cache.r5.large | $150 - $250 |
| **S3 Storage** | 10TB videos + backups | $300 - $500 |
| **CloudFront CDN** | 50TB transferencia | $400 - $600 |
| **Mux Video** | 1000 horas streaming | $500 - $800 |
| **Load Balancer** | ALB | $50 - $100 |
| **Monitoring** | Datadog | $200 - $400 |
| **Total** | | **$2,200 - $4,750/mes** |

---

## 9. Roadmap de Implementación

### Fase 1: MVP (Meses 1-3)
- [ ] Autenticación y gestión de usuarios
- [ ] CRUD de cursos básico
- [ ] Subida y reproducción de videos
- [ ] Sistema de inscripciones
- [ ] Progreso básico del estudiante
- [ ] Pagos con Stripe

### Fase 2: Core Features (Meses 4-6)
- [ ] Quizzes y assessments
- [ ] Sistema de reseñas
- [ ] Panel de instructor completo
- [ ] Notificaciones
- [ ] Certificados
- [ ] Búsqueda con Elasticsearch

### Fase 3: Escalabilidad (Meses 7-9)
- [ ] Microservicios
- [ ] Caché distribuido
- [ ] Analytics avanzados
- [ ] WebSockets para tiempo real
- [ ] API pública
- [ ] Mobile app

### Fase 4: Enterprise (Meses 10-12)
- [ ] SSO/SAML
- [ ] White-label
- [ ] Integraciones avanzadas
- [ ] AI-powered recommendations
- [ ] Advanced reporting
- [ ] Multi-tenant

---

## 10. Conclusiones

Esta arquitectura proporciona:

1. **Escalabilidad**: Kubernetes con auto-scaling horizontal y vertical
2. **Rendimiento**: Multi-layer caching, CDN global, conexiones persistentes
3. **Seguridad**: JWT con refresh tokens, RBAC/ABAC, rate limiting, WAF
4. **Mantenibilidad**: TypeScript end-to-end, arquitectura modular, documentación automática
5. **Resiliencia**: Circuit breakers, health checks, backups automatizados
6. **Observabilidad**: Métricas, logs, tracing distribuido

La elección de Next.js + NestJS + PostgreSQL proporciona un stack moderno, type-safe y probado en producción para aplicaciones de alta escala.
