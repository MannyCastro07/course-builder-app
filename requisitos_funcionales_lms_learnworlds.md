# REQUISITOS FUNCIONALES - PLATAFORMA LMS TIPO LEARNWORLDS
## Documento de Análisis Funcional Completo

---

## ÍNDICE

1. [Dashboard de Autor/Administrador](#1-dashboard-de-autoradministrador)
2. [Sistema de Gestión de Cursos (CRUD)](#2-sistema-de-gestión-de-cursos-crud)
3. [Constructor de Contenido con Editor Visual](#3-constructor-de-contenido-con-editor-visual)
4. [Gestión de Estudiantes y Usuarios](#4-gestión-de-estudiantes-y-usuarios)
5. [Sistema de Autenticación y Autorización](#5-sistema-de-autenticación-y-autorización)
6. [Gestión de Contenido Multimedia](#6-gestión-de-contenido-multimedia)
7. [Configuración de Precios y Tipos de Acceso](#7-configuración-de-precios-y-tipos-de-acceso)
8. [Herramientas de Marketing](#8-herramientas-de-marketing)
9. [Sistema de Reportes y Análisis](#9-sistema-de-reportes-y-análisis)
10. [Personalización de Marca](#10-personalización-de-marca)

---

# 1. DASHBOARD DE AUTOR/ADMINISTRADOR

## 1.1 Descripción General

El Dashboard es el centro de control principal donde los autores y administradores pueden visualizar el estado general de su plataforma de e-learning, acceder a métricas clave de rendimiento y navegar rápidamente a las diferentes funcionalidades del sistema.

## 1.2 Funcionalidades Principales

### 1.2.1 Panel de Métricas Clave (KPIs)

| Métrica | Descripción | Frecuencia de Actualización |
|---------|-------------|----------------------------|
| Ingresos Totales | Suma de todas las ventas de cursos | Tiempo real |
| Ingresos del Mes | Ventas acumuladas del mes actual | Tiempo real |
| Total de Estudiantes | Número de usuarios registrados | Tiempo real |
| Estudiantes Activos | Usuarios con actividad en los últimos 30 días | Diaria |
| Tasa de Finalización | Porcentaje de estudiantes que completan cursos | Diaria |
| Cursos Publicados | Número de cursos activos | Tiempo real |
| Cursos en Borrador | Cursos en desarrollo | Tiempo real |
| Valor Promedio de Orden (AOV) | Ingreso promedio por transacción | Tiempo real |
| Tasa de Conversión | Visitantes que se convierten en compradores | Diaria |

### 1.2.2 Widgets del Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  RESUMEN EJECUTIVO                                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  $12,450        │  1,234          │  89%                        │
│  Ingresos Hoy   │  Estudiantes    │  Tasa de Satisfacción       │
├─────────────────┴─────────────────┴─────────────────────────────┤
│  GRÁFICO DE INGRESOS (últimos 30 días)                         │
│  [Gráfico de líneas interactivo]                               │
├─────────────────────────────┬───────────────────────────────────┤
│  CURSOS MÁS POPULARES       │  ACTIVIDAD RECIENTE               │
│  1. Curso de Marketing      │  • Juan compró "Diseño UX"        │
│  2. Programación Python     │  • María completó Módulo 3        │
│  3. Diseño Gráfico          │  • Pedro se registró              │
├─────────────────────────────┴───────────────────────────────────┤
│  TAREAS PENDIENTES                                              │
│  [ ] Revisar 5 tareas de evaluación                            │
│  [ ] Responder 3 mensajes de estudiantes                       │
│  [ ] Actualizar contenido del Curso de Excel                   │
└─────────────────────────────────────────────────────────────────┘
```

## 1.3 Flujos de Usuario Principales

### Flujo 1: Acceso al Dashboard
```
1. Usuario inicia sesión → 2. Sistema valida credenciales → 
3. Redirección al Dashboard → 4. Carga de widgets personalizados → 
5. Visualización de métricas en tiempo real
```

### Flujo 2: Personalización del Dashboard
```
1. Usuario accede a "Personalizar Dashboard" → 2. Arrastra widgets disponibles →
3. Configura rangos de fechas → 4. Guarda configuración → 
5. Dashboard se actualiza con nueva disposición
```

### Flujo 3: Navegación Rápida
```
1. Usuario visualiza Dashboard → 2. Identifica acción requerida →
3. Clic en acceso directo → 4. Redirección a módulo específico
```

## 1.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-DASH-001 | Visualizar métricas de rendimiento | Administrador | Ver KPIs clave del negocio |
| CU-DASH-002 | Filtrar datos por período | Autor | Seleccionar rango de fechas para análisis |
| CU-DASH-003 | Exportar reporte del dashboard | Administrador | Descargar datos en CSV/PDF |
| CU-DASH-004 | Configurar alertas | Autor | Establecer notificaciones para métricas |
| CU-DASH-005 | Comparar períodos | Administrador | Analizar crecimiento mes a mes |

## 1.5 Reglas de Negocio

- **RN-DASH-001**: Las métricas de ingresos deben actualizarse en tiempo real
- **RN-DASH-002**: El dashboard debe cargar en menos de 3 segundos
- **RN-DASH-003**: Los usuarios pueden personalizar máximo 6 widgets visibles
- **RN-DASH-004**: Los datos históricos deben mantenerse por mínimo 2 años
- **RN-DASH-005**: Las alertas se envían por email cuando se alcanzan umbrales configurados

---

# 2. SISTEMA DE GESTIÓN DE CURSOS (CRUD)

## 2.1 Descripción General

Sistema completo para crear, leer, actualizar y eliminar cursos, incluyendo gestión de estructura, contenido, configuraciones y estados de publicación.

## 2.2 Funcionalidades Principales

### 2.2.1 Creación de Cursos

#### Campos Obligatorios:
- Título del curso (máx. 100 caracteres)
- Descripción corta (máx. 200 caracteres)
- Categoría principal
- Nivel de dificultad (Principiante, Intermedio, Avanzado, Todos)

#### Campos Opcionales:
- Descripción completa (HTML enriquecido)
- Objetivos de aprendizaje
- Requisitos previos
- Imagen de portada (mín. 1200x630px)
- Video de introducción
- Certificado de finalización
- Metadatos SEO

### 2.2.2 Estructura de Curso

```
CURSO
├── Información General
│   ├── Título, descripción, imagen
│   ├── Configuración de acceso
│   └── SEO y metadatos
├──
├── Módulos (Secciones)
│   ├── Módulo 1: Introducción
│   │   ├── Lección 1.1: Bienvenida
│   │   ├── Lección 1.2: Objetivos
│   │   └── Lección 1.3: ¿Qué aprenderás?
│   ├──
│   ├── Módulo 2: Fundamentos
│   │   ├── Lección 2.1: Conceptos básicos
│   │   ├── Lección 2.2: Ejercicio práctico
│   │   └── Evaluación: Quiz de conocimientos
│   └──
│   └── Módulo N: Conclusión
│
├── Recursos Adicionales
│   ├── Material descargable
│   ├── Bibliografía
│   └── Enlaces externos
│
└── Configuración Avanzada
    ├── Prerrequisitos
    ├── Progresión secuencial
    └── Fechas de disponibilidad
```

### 2.2.3 Estados del Curso

| Estado | Descripción | Visibilidad |
|--------|-------------|-------------|
| Borrador | En desarrollo, no visible | Solo autor/admin |
| Revisión | Pendiente de aprobación | Solo autor/admin |
| Publicado | Activo y disponible | Público/Estudiantes |
| Privado | Acceso restringido | Solo invitados |
| Archivado | Inactivo, no editable | Solo admin |

## 2.3 Flujos de Usuario Principales

### Flujo 1: Creación de Nuevo Curso
```
1. Clic en "Crear Curso" → 2. Completar información básica →
3. Configurar estructura de módulos → 4. Agregar contenido a lecciones →
5. Configurar precio y acceso → 6. Previsualizar curso →
7. Publicar o guardar como borrador
```

### Flujo 2: Edición de Curso Existente
```
1. Seleccionar curso del listado → 2. Acceder a modo edición →
3. Modificar secciones necesarias → 4. Guardar cambios →
5. Opcional: Notificar estudiantes de actualización
```

### Flujo 3: Clonación de Curso
```
1. Seleccionar curso base → 2. Clic en "Duplicar" →
3. Confirmar elementos a copiar → 4. Sistema crea copia →
5. Editar curso clonado independientemente
```

## 2.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-CUR-001 | Crear curso nuevo | Autor | Iniciar creación desde cero |
| CU-CUR-002 | Editar curso existente | Autor | Modificar contenido publicado |
| CU-CUR-003 | Eliminar curso | Administrador | Eliminar permanentemente |
| CU-CUR-004 | Duplicar curso | Autor | Crear copia como base |
| CU-CUR-005 | Publicar curso | Autor | Cambiar estado a publicado |
| CU-CUR-006 | Archivar curso | Administrador | Desactivar sin eliminar |
| CU-CUR-007 | Gestionar módulos | Autor | CRUD de secciones |
| CU-CUR-008 | Reordenar contenido | Autor | Cambiar orden de lecciones |
| CU-CUR-009 | Configurar prerrequisitos | Autor | Establecer dependencias |
| CU-CUR-010 | Importar curso | Administrador | Cargar desde archivo SCORM/xAPI |

## 2.5 Reglas de Negocio

- **RN-CUR-001**: Un curso debe tener mínimo 1 módulo y 1 lección para publicarse
- **RN-CUR-002**: El título debe ser único en la plataforma
- **RN-CUR-003**: Los cursos publicados no pueden eliminarse, solo archivarse
- **RN-CUR-004**: La imagen de portada debe cumplir dimensiones mínimas
- **RN-CUR-005**: Los cambios en cursos publicados requieren confirmación
- **RN-CUR-006**: Los estudiantes inscritos deben ser notificados de cambios significativos
- **RN-CUR-007**: Máximo 100 módulos por curso, 50 lecciones por módulo

---

# 3. CONSTRUCTOR DE CONTENIDO CON EDITOR VISUAL

## 3.1 Descripción General

Editor WYSIWYG (What You See Is What You Get) que permite a los autores crear contenido educativo rico y multimedia sin necesidad de conocimientos técnicos de programación.

## 3.2 Funcionalidades Principales

### 3.2.1 Tipos de Contenido Soportados

#### Lecciones de Video
- Subida de archivos (MP4, MOV, AVI - máx. 2GB)
- Integración con Vimeo/YouTube/Wistia
- Reproductor personalizable
- Controles de velocidad (0.5x - 2x)
- Marcadores de capítulos
- Subtítulos/Transcripciones (VTT, SRT)

#### Lecciones de Texto
- Editor de texto enriquecido
- Formato HTML completo
- Bloques de código con resaltado de sintaxis
- Tablas y listas
- Citas y callouts

#### Lecciones de Audio
- Reproductor de audio integrado
- Podcasts y material auditivo
- Transcripciones automáticas

#### Lecciones Interactivas
- Quizzes y evaluaciones
- Encuestas
- Tareas y proyectos
- Contenido SCORM/xAPI
- H5P interactive content

### 3.2.2 Elementos del Editor Visual

```
┌─────────────────────────────────────────────────────────────────┐
│  BARRA DE HERRAMIENTAS DEL EDITOR                               │
├─────────────────────────────────────────────────────────────────┤
│  [B][I][U]  [H1][H2][H3]  [Lista][Numerada]  [Tabla] [Código] │
│  [Imagen][Video][Audio][PDF][Enlace][HTML][Emoji][Divider]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ÁREA DE EDICIÓN                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  [Arrastra elementos aquí o escribe tu contenido]      │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────────────────────────┐  │   │
│  │  │   VIDEO     │  │           TEXTO                 │  │   │
│  │  │  [player]   │  │  Contenido editable...          │  │   │
│  │  └─────────────┘  └─────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              QUIZ INTERACTIVO                    │   │   │
│  │  │  Pregunta: ¿Cuál es la respuesta correcta?      │   │   │
│  │  │  ( ) Opción A    (X) Opción B    ( ) Opción C   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Vista Previa]  [Guardar Borrador]  [Publicar]  [Configuración]│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2.3 Bloques de Contenido Predefinidos

| Bloque | Descripción | Personalizable |
|--------|-------------|----------------|
| Hero Section | Banner con imagen de fondo y texto | Sí |
| Call to Action | Botón destacado con mensaje | Sí |
| Testimonio | Cita con foto y autor | Sí |
| Instructor Bio | Perfil del instructor | Sí |
| Recursos | Lista de descargables | Sí |
| Progreso | Barra de avance del curso | Parcial |
| Próxima Lección | Enlace a continuación | No |
| Nota Importante | Callout destacado | Sí |

## 3.3 Flujos de Usuario Principales

### Flujo 1: Crear Lección de Video
```
1. Seleccionar tipo "Video" → 2. Subir archivo o pegar URL →
3. Configurar opciones del reproductor → 4. Agregar descripción →
5. Configurar subtítulos opcionales → 6. Guardar lección
```

### Flujo 2: Crear Quiz de Evaluación
```
1. Seleccionar tipo "Quiz" → 2. Configurar configuración general →
3. Agregar preguntas (tipos: opción múltiple, verdadero/falso, emparejamiento, abierta) →
4. Definir respuestas correctas y puntajes → 5. Configurar retroalimentación →
6. Establecer criterios de aprobación → 7. Guardar y publicar
```

### Flujo 3: Editar Contenido Existente
```
1. Abrir lección en modo edición → 2. Modificar elementos →
3. Usar historial de versiones si es necesario → 4. Previsualizar cambios →
5. Guardar o publicar actualización
```

## 3.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-EDT-001 | Crear lección de video | Autor | Subir contenido multimedia |
| CU-EDT-002 | Crear lección de texto | Autor | Redactar contenido escrito |
| CU-EDT-003 | Crear quiz/evaluación | Autor | Diseñar examen interactivo |
| CU-EDT-004 | Agregar recursos descargables | Autor | Adjuntar PDFs y archivos |
| CU-EDT-005 | Insertar contenido embebido | Autor | Incrustar de terceros |
| CU-EDT-006 | Configurar progresión | Autor | Establecer orden y dependencias |
| CU-EDT-007 | Usar plantilla de lección | Autor | Aplicar formato predefinido |
| CU-EDT-008 | Previsualizar lección | Autor | Ver como estudiante |
| CU-EDT-009 | Duplicar lección | Autor | Copiar como base |
| CU-EDT-010 | Gestionar versiones | Autor | Ver historial de cambios |

## 3.5 Reglas de Negocio

- **RN-EDT-001**: Las lecciones deben auto-guardarse cada 30 segundos
- **RN-EDT-002**: Máximo 100 elementos por lección
- **RN-EDT-003**: Los videos se procesan automáticamente en múltiples resoluciones
- **RN-EDT-004**: Los quizzes deben tener mínimo 1 pregunta
- **RN-EDT-005**: Las respuestas correctas se revelan según configuración del autor
- **RN-EDT-006**: El contenido HTML se sanitiza antes de guardar
- **RN-EDT-007**: Las imágenes se optimizan automáticamente para web
- **RN-EDT-008**: Se mantiene historial de versiones (últimas 20)

---

# 4. GESTIÓN DE ESTUDIANTES Y USUARIOS

## 4.1 Descripción General

Sistema completo para administrar la base de usuarios, incluyendo estudiantes, instructores y administradores, con herramientas de seguimiento, comunicación y gestión de roles.

## 4.2 Funcionalidades Principales

### 4.2.1 Perfiles de Usuario

#### Información del Perfil:
- Datos básicos (nombre, email, foto)
- Información profesional
- Biografía
- Redes sociales
- Preferencias de notificación
- Historial de aprendizaje
- Certificados obtenidos

#### Tipos de Usuario:

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| Estudiante | Ver cursos, completar lecciones, participar en comunidad | Usuario estándar |
| Autor/Instructor | Crear cursos, gestionar contenido, ver analytics de sus cursos | Creador de contenido |
| Administrador | Acceso total, gestión de usuarios, configuración de plataforma | Super usuario |
| Afiliado | Enlaces de referido, ver comisiones | Promotor |
| Soporte | Ver cursos, asistir estudiantes, gestionar tickets | Atención al cliente |

### 4.2.2 Gestión de Inscripciones

```
┌─────────────────────────────────────────────────────────────────┐
│  GESTIÓN DE INSCRIPCIONES                                       │
├─────────────────────────────────────────────────────────────────┤
│  Filtros: [Curso: Todos ▼] [Estado: Todos ▼] [Fecha: ▼]        │
│  Buscar: [____________________] [Buscar]                        │
├─────────────────────────────────────────────────────────────────┤
│  Estudiante        │ Curso              │ Progreso │ Estado    │
├───────────────────┼────────────────────┼──────────┼───────────┤
│  María García     │ Marketing Digital  │ 75%      │ Activo    │
│  Juan Pérez       │ Python Básico      │ 100%     │ Completado│
│  Ana López        │ Diseño UX          │ 30%      │ Inactivo  │
│  Carlos Ruiz      │ Excel Avanzado     │ 0%       │ Inscrito  │
├───────────────────┴────────────────────┴──────────┴───────────┤
│  Acciones: [Inscribir Manual] [Exportar] [Enviar Mensaje]      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2.3 Seguimiento de Progreso

- Porcentaje de completitud por curso
- Tiempo dedicado
- Lecciones completadas
- Evaluaciones realizadas
- Puntajes obtenidos
- Última actividad
- Racha de días consecutivos
- Fecha estimada de finalización

### 4.2.4 Comunicación con Estudiantes

- Mensajes directos (1 a 1)
- Anuncios de curso (broadcast)
- Notificaciones automáticas
- Email marketing integrado
- Foros de discusión
- Chat en vivo (opcional)

## 4.3 Flujos de Usuario Principales

### Flujo 1: Inscripción Manual
```
1. Acceder a gestión de estudiantes → 2. Clic en "Inscribir Manual" →
3. Buscar usuario existente o crear nuevo → 4. Seleccionar curso(s) →
5. Configurar tipo de acceso (gratis/pago/cortesía) → 6. Confirmar inscripción
```

### Flujo 2: Seguimiento de Estudiante
```
1. Buscar estudiante → 2. Acceder a perfil detallado →
3. Visualizar progreso en todos los cursos → 4. Ver historial de actividad →
5. Identificar áreas de dificultad → 6. Enviar mensaje de seguimiento
```

### Flujo 3: Gestión de Grupos
```
1. Crear grupo de estudiantes → 2. Asignar nombre y descripción →
3. Agregar estudiantes al grupo → 4. Asignar curso(s) al grupo →
5. Configurar acceso diferenciado → 6. Monitorear progreso grupal
```

## 4.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-USR-001 | Registrar estudiante | Sistema/Admin | Crear cuenta de usuario |
| CU-USR-002 | Inscribir en curso | Admin/Autor | Dar acceso a curso |
| CU-USR-003 | Cancelar inscripción | Admin | Revocar acceso |
| CU-USR-004 | Suspender usuario | Admin | Desactivar cuenta |
| CU-USR-005 | Exportar lista de estudiantes | Admin | Descargar datos |
| CU-USR-006 | Filtrar estudiantes | Admin | Buscar por criterios |
| CU-USR-007 | Ver progreso individual | Admin/Autor | Detalle de avance |
| CU-USR-008 | Enviar mensaje masivo | Admin/Autor | Comunicación grupal |
| CU-USR-009 | Asignar roles | Admin | Cambiar permisos |
| CU-USR-010 | Crear grupo de estudiantes | Admin | Segmentación |

## 4.5 Reglas de Negocio

- **RN-USR-001**: El email debe ser único en la plataforma
- **RN-USR-002**: Las contraseñas deben cumplir requisitos de seguridad
- **RN-USR-003**: Los estudiantes pueden inscribirse en múltiples cursos
- **RN-USR-004**: El progreso se guarda automáticamente
- **RN-USR-005**: Los datos personales deben cumplir GDPR/LGPD
- **RN-USR-006**: Las cuentas inactivas por 2 años se marcan como dormidas
- **RN-USR-007**: Los estudiantes pueden exportar sus certificados
- **RN-USR-008**: Los mensajes masivos tienen límite de 1000 destinatarios/envío

---

# 5. SISTEMA DE AUTENTICACIÓN Y AUTORIZACIÓN

## 5.1 Descripción General

Sistema seguro de gestión de identidad que controla el acceso a la plataforma y define qué acciones puede realizar cada tipo de usuario.

## 5.2 Funcionalidades Principales

### 5.2.1 Métodos de Autenticación

| Método | Descripción | Prioridad |
|--------|-------------|-----------|
| Email + Contraseña | Autenticación tradicional | Principal |
| SSO (Single Sign-On) | Google, Microsoft, LinkedIn | Secundario |
| Magic Links | Enlace de acceso sin contraseña | Alternativo |
| 2FA/MFA | Autenticación de dos factores | Opcional |
| SAML | Integración empresarial | Enterprise |
| LDAP | Directorio activo | Enterprise |

### 5.2.2 Flujo de Registro

```
OPCIÓN A: Registro Directo
1. Usuario accede a página de registro
2. Completa: Nombre, Email, Contraseña
3. Acepta términos y condiciones
4. Verifica email (token)
5. Perfil creado, acceso concedido

OPCIÓN B: Registro Social
1. Usuario selecciona proveedor (Google/Facebook/LinkedIn)
2. Autoriza aplicación
3. Datos básicos importados
4. Completar información adicional si es necesario
5. Acceso inmediato
```

### 5.2.3 Matriz de Permisos (RBAC)

| Funcionalidad | Estudiante | Instructor | Admin | Soporte |
|--------------|------------|------------|-------|---------|
| Ver cursos | ✅ | ✅ | ✅ | ✅ |
| Comprar cursos | ✅ | ✅ | ✅ | ❌ |
| Crear cursos | ❌ | ✅ | ✅ | ❌ |
| Editar cursos propios | ❌ | ✅ | ✅ | ❌ |
| Editar todos los cursos | ❌ | ❌ | ✅ | ❌ |
| Gestionar usuarios | ❌ | ❌ | ✅ | ✅ |
| Ver analytics propios | ❌ | ✅ | ✅ | ❌ |
| Ver todos los analytics | ❌ | ❌ | ✅ | ✅ |
| Configurar plataforma | ❌ | ❌ | ✅ | ❌ |
| Gestionar pagos | ❌ | ❌ | ✅ | ❌ |
| Acceder a soporte | ✅ | ✅ | ✅ | ✅ |
| Proveer soporte | ❌ | ❌ | ✅ | ✅ |

### 5.2.4 Gestión de Sesiones

- Timeout de sesión: 30 minutos de inactividad
- Máximo de sesiones simultáneas por usuario: 3
- Registro de actividad de login
- Detección de acceso sospechoso
- Bloqueo temporal tras intentos fallidos (5 intentos)
- Notificación de nuevo dispositivo

## 5.3 Flujos de Usuario Principales

### Flujo 1: Login Estándar
```
1. Usuario ingresa email y contraseña → 2. Sistema valida credenciales →
3. Si 2FA activado: solicitar código → 4. Verificar sesiones activas →
5. Crear sesión y token JWT → 6. Redireccionar al dashboard
```

### Flujo 2: Recuperación de Contraseña
```
1. Usuario clic en "¿Olvidaste tu contraseña?" → 2. Ingresa email →
3. Sistema envía email con token → 4. Usuario accede al enlace →
5. Ingresa nueva contraseña → 6. Confirma cambio → 7. Login automático
```

### Flujo 3: Cambio de Rol
```
1. Admin accede a gestión de usuarios → 2. Selecciona usuario →
3. Edita roles asignados → 4. Sistema valida permisos →
5. Actualiza roles → 6. Notifica al usuario del cambio
```

## 5.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-AUTH-001 | Registrar cuenta nueva | Visitante | Crear perfil de usuario |
| CU-AUTH-002 | Iniciar sesión | Usuario | Acceder a plataforma |
| CU-AUTH-003 | Cerrar sesión | Usuario | Terminar sesión |
| CU-AUTH-004 | Recuperar contraseña | Usuario | Restablecer acceso |
| CU-AUTH-005 | Cambiar contraseña | Usuario | Actualizar credencial |
| CU-AUTH-006 | Configurar 2FA | Usuario | Activar doble factor |
| CU-AUTH-007 | Gestionar sesiones | Usuario | Ver/cerrar sesiones |
| CU-AUTH-008 | Asignar roles | Admin | Definir permisos |
| CU-AUTH-009 | Bloquear usuario | Admin | Suspender acceso |
| CU-AUTH-010 | Auditar actividad | Admin | Revisar logs de seguridad |

## 5.5 Reglas de Negocio

- **RN-AUTH-001**: Las contraseñas deben tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números
- **RN-AUTH-002**: Los tokens de recuperación expiran en 24 horas
- **RN-AUTH-003**: Las sesiones JWT expiran en 7 días (remember me) o 2 horas
- **RN-AUTH-004**: Se registra todo intento de login fallido
- **RN-AUTH-005**: La cuenta se bloquea temporalmente tras 5 intentos fallidos
- **RN-AUTH-006**: El cambio de email requiere verificación
- **RN-AUTH-007**: Los usuarios pueden revocar acceso de dispositivos
- **RN-AUTH-008**: Los logs de auditoría se mantienen por 2 años

---

# 6. GESTIÓN DE CONTENIDO MULTIMEDIA

## 6.1 Descripción General

Sistema de almacenamiento, procesamiento y gestión de archivos multimedia que soporta la creación de contenido educativo rico.

## 6.2 Funcionalidades Principales

### 6.2.1 Tipos de Archivos Soportados

| Tipo | Formatos | Tamaño Máximo | Uso Principal |
|------|----------|---------------|---------------|
| Video | MP4, MOV, AVI, WebM | 2 GB | Lecciones principales |
| Audio | MP3, WAV, AAC, OGG | 100 MB | Podcasts, narraciones |
| Imagen | JPG, PNG, GIF, WebP, SVG | 10 MB | Portadas, contenido |
| Documento | PDF, DOC, DOCX, XLS, XLSX, PPT | 50 MB | Recursos descargables |
| Archivo | ZIP, RAR | 100 MB | Paquetes de recursos |
| SCORM | ZIP (SCORM 1.2/2004) | 500 MB | Contenido interactivo |

### 6.2.2 Biblioteca de Medios

```
┌─────────────────────────────────────────────────────────────────┐
│  BIBLIOTECA DE MEDIOS                                           │
├─────────────────────────────────────────────────────────────────┤
│  [Subir Archivo]  [Crear Carpeta]  [Seleccionar Múltiples]     │
│  Vista: [Iconos ▼] | Ordenar por: [Fecha ▼]                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 📹      │ │ 📄      │ │ 🖼️      │ │ 📹      │ │ 📁      │   │
│  │ video1  │ │ doc.pdf │ │ img.png │ │ intro   │ │ Recursos│   │
│  │ 45 MB   │ │ 2 MB    │ │ 1 MB    │ │ 120 MB  │ │ -       │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ 🎵      │ │ 📹      │ │ 🖼️      │                           │
│  │ audio   │ │ demo    │ │ banner  │                           │
│  │ 15 MB   │ │ 89 MB   │ │ 3 MB    │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
├─────────────────────────────────────────────────────────────────┤
│  Almacenamiento usado: 45.2 GB / 100 GB                        │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2.3 Procesamiento de Video

- **Subida**: Drag & drop o selector de archivos
- **Procesamiento**: Conversión automática a múltiples resoluciones
  - 1080p (HD)
  - 720p
  - 480p
  - 360p (para conexiones lentas)
- **Generación automática**:
  - Thumbnail de preview
  - Transcripción (si está habilitada)
  - Subtítulos automáticos (opcional)
- **Streaming**: Adaptive bitrate streaming (HLS/DASH)

### 6.2.4 Optimización de Imágenes

- Compresión automática sin pérdida visible
- Generación de múltiples tamaños:
  - Thumbnail (150x150)
  - Pequeña (300x300)
  - Mediana (600x600)
  - Grande (1200x1200)
- Conversión a WebP cuando es soportado
- Lazy loading en visualización

## 6.3 Flujos de Usuario Principales

### Flujo 1: Subir Video
```
1. Acceder a Biblioteca de Medios → 2. Clic en "Subir Video" →
3. Seleccionar archivo o arrastrar → 4. Inicia subida con barra de progreso →
5. Sistema procesa video en background → 6. Notificación cuando está listo →
7. Video disponible para usar en lecciones
```

### Flujo 2: Organizar Archivos
```
1. Acceder a Biblioteca → 2. Crear carpetas por curso/tema →
3. Seleccionar archivos → 4. Mover a carpeta correspondiente →
5. Opcional: Renombrar con convención → 6. Aplicar tags para búsqueda
```

### Flujo 3: Insertar Multimedia en Lección
```
1. Editar lección → 2. Clic en botón de multimedia →
3. Seleccionar desde biblioteca o subir nuevo → 4. Configurar opciones de visualización →
5. Insertar en contenido → 6. Previsualizar resultado
```

## 6.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-MED-001 | Subir archivo | Autor | Agregar multimedia |
| CU-MED-002 | Eliminar archivo | Autor/Admin | Remover de biblioteca |
| CU-MED-003 | Organizar en carpetas | Autor | Estructurar contenido |
| CU-MED-004 | Buscar archivo | Autor | Encontrar por nombre/tag |
| CU-MED-005 | Reemplazar archivo | Autor | Actualizar versión |
| CU-MED-006 | Configurar privacidad | Autor | Público/privado |
| CU-MED-007 | Ver estadísticas de uso | Autor | Reproducciones, descargas |
| CU-MED-008 | Exportar biblioteca | Admin | Backup de archivos |
| CU-MED-009 | Gestionar almacenamiento | Admin | Cuotas y límites |
| CU-MED-010 | Configurar CDN | Admin | Optimizar distribución |

## 6.5 Reglas de Negocio

- **RN-MED-001**: Cada usuario tiene cuota de almacenamiento según plan
- **RN-MED-002**: Los archivos se escanean antivirus antes de procesar
- **RN-MED-003**: Los videos se procesan en cola de background
- **RN-MED-004**: Los archivos no utilizados por 1 año se archivan
- **RN-MED-005**: El contenido ilegal se elimina automáticamente
- **RN-MED-006**: Las imágenes se comprimen automáticamente
- **RN-MED-007**: Los archivos de curso eliminado se mantienen 30 días
- **RN-MED-008**: Se respalda contenido crítico en múltiples ubicaciones

---

# 7. CONFIGURACIÓN DE PRECIOS Y TIPOS DE ACCESO

## 7.1 Descripción General

Sistema flexible de monetización que permite configurar diferentes modelos de precios y acceso para los cursos, adaptándose a diversas estrategias de negocio.

## 7.2 Funcionalidades Principales

### 7.2.1 Modelos de Precios

| Modelo | Descripción | Caso de Uso |
|--------|-------------|-------------|
| **Gratis** | Acceso sin costo | Lead magnet, contenido introductorio |
| **Pago Único** | Compra única, acceso de por vida | Cursos individuales |
| **Suscripción** | Pago recurrente por acceso | Biblioteca completa |
| **Membresía** | Acceso a colección de cursos | Programas estructurados |
| **Pago por Módulo** | Compra granular de contenido | Cursos extensos |
| **Freemium** | Básico gratis, premium de pago | Upsell automático |
| **Privado** | Solo acceso por invitación | Cursos corporativos |
| **Prueba Gratuita** | Acceso limitado por tiempo | Conversión a pago |

### 7.2.2 Estructura de Configuración de Precios

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DE PRECIO - Curso: Marketing Digital            │
├─────────────────────────────────────────────────────────────────┤
│  TIPO DE ACCESO                                                 │
│  (•) Gratuito  ( ) De Pago  ( ) Privado  ( ) Membresía         │
│                                                                 │
│  PRECIO                                                         │
│  Precio regular:    $ [  97  . 00 ]                            │
│  Precio oferta:     $ [  67  . 00 ]                            │
│  Fecha oferta:      [De: ____/__/__] [A: ____/__/__]           │
│                                                                 │
│  SUSCRIPCIÓN (si aplica)                                        │
│  Periodicidad: [ Mensual ▼ ]                                    │
│  Precio: $ [  29  . 00 ] / mes                                 │
│  Prueba gratuita: [ 7 ] días                                    │
│                                                                 │
│  PAGO EN CUOTAS                                                 │
│  [✓] Permitir pago en cuotas                                   │
│  Número de cuotas: [ 3 ]                                        │
│  Precio por cuota: $ [  35  . 00 ]                             │
│                                                                 │
│  MONEDAS ACEPTADAS                                              │
│  [✓] USD  [✓] EUR  [✓] GBP  [ ] MXN  [ ] BRL                   │
├─────────────────────────────────────────────────────────────────┤
│  [Guardar Configuración]                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2.3 Tipos de Acceso Detallados

#### Acceso Gratuito
- Sin requerimiento de pago
- Registro de usuario puede ser requerido
- Limitaciones opcionales (tiempo, contenido)

#### Acceso de Pago
- Precio único o recurrente
- Acceso de por vida o por tiempo definido
- Posibilidad de reembolso según política

#### Acceso Privado
- Solo por invitación directa
- URL de acceso exclusivo
- Ideal para capacitación corporativa

#### Acceso por Membresía
- Agrupación de cursos
- Niveles de membresía (Básica, Premium, VIP)
- Acceso escalonado según nivel

### 7.2.4 Programas de Pago

| Programa | Descripción | Configuración |
|----------|-------------|---------------|
| Pago único | Compra inmediata | Precio fijo |
| Suscripción mensual | Acceso mientras paga | Renovación automática |
| Suscripción anual | Descuento por compromiso | 2 meses gratis |
| Pago en cuotas | Fraccionamiento sin intereses | 3-12 cuotas |
| Pago diferido | Comienza a pagar después | 30 días gratis |

## 7.3 Flujos de Usuario Principales

### Flujo 1: Configurar Curso de Pago
```
1. Editar curso → 2. Acceder a "Precio y Acceso" →
3. Seleccionar "De Pago" → 4. Ingresar precio regular →
5. Opcional: Configurar precio de oferta → 6. Definir monedas →
7. Configurar opciones de pago → 8. Guardar y publicar
```

### Flujo 2: Crear Membresía
```
1. Acceder a gestión de membresías → 2. Crear nueva membresía →
3. Definir nombre y descripción → 4. Seleccionar cursos incluidos →
5. Configurar precio y periodicidad → 6. Establecer beneficios extras →
7. Publicar membresía
```

### Flujo 3: Configurar Acceso Privado
```
1. Seleccionar curso → 2. Cambiar a "Acceso Privado" →
3. Generar URLs de invitación → 4. Definir límite de usos →
5. Establecer fecha de expiración → 6. Compartir URLs con usuarios
```

## 7.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-PRC-001 | Configurar precio de curso | Autor | Establecer costo |
| CU-PRC-002 | Crear oferta temporal | Autor | Descuento por tiempo |
| CU-PRC-003 | Configurar suscripción | Admin | Modelo recurrente |
| CU-PRC-004 | Crear membresía | Admin | Paquete de cursos |
| CU-PRC-005 | Gestionar cupones | Autor | Códigos de descuento |
| CU-PRC-006 | Configurar pago en cuotas | Admin | Fraccionamiento |
| CU-PRC-007 | Establecer acceso privado | Autor | Solo por invitación |
| CU-PRC-008 | Configurar prueba gratuita | Autor | Acceso limitado |
| CU-PRC-009 | Gestionar monedas | Admin | Divisas aceptadas |
| CU-PRC-010 | Configurar impuestos | Admin | IVA/impuestos locales |

## 7.5 Reglas de Negocio

- **RN-PRC-001**: El precio mínimo es $1 USD (o equivalente)
- **RN-PRC-002**: Las ofertas no pueden superar el 90% de descuento
- **RN-PRC-003**: Los precios se muestran siempre con IVA incluido
- **RN-PRC-004**: Las suscripciones se renuevan automáticamente
- **RN-PRC-005**: Los usuarios pueden cancelar suscripción en cualquier momento
- **RN-PRC-006**: El acceso se mantiene hasta el final del período pagado
- **RN-PRC-007**: Los cursos gratuitos pueden requerir registro
- **RN-PRC-008**: Las membresías pueden tener cursos exclusivos

---

# 8. HERRAMIENTAS DE MARKETING

## 8.1 Descripción General

Conjunto de herramientas integradas para promocionar cursos, atraer estudiantes y maximizar conversiones mediante estrategias de marketing digital.

## 8.2 Funcionalidades Principales

### 8.2.1 Sistema de Cupones

```
┌─────────────────────────────────────────────────────────────────┐
│  GESTIÓN DE CUPONES                                             │
├─────────────────────────────────────────────────────────────────┤
│  [Crear Cupón]  [Importar]  [Exportar]                          │
├─────────────────────────────────────────────────────────────────┤
│  Código      │ Descuento  │ Válido hasta │ Usos    │ Estado    │
├──────────────┼────────────┼──────────────┼─────────┼───────────┤
│  VERANO2024  │ 30%        │ 31/08/2024   │ 45/100  │ Activo    │
│  BIENVENIDO  │ $20        │ Ilimitado    │ 234/∞   │ Activo    │
│  FLASH50     │ 50%        │ 15/07/2024   │ 98/100  │ Expirado  │
│  VIPACCESS   │ 100%       │ 31/12/2024   │ 5/50    │ Activo    │
├──────────────┴────────────┴──────────────┴─────────┴───────────┤
│  Acciones: [Editar] [Duplicar] [Desactivar] [Eliminar]         │
└─────────────────────────────────────────────────────────────────┘
```

#### Tipos de Cupones:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| Porcentaje | Descuento % sobre total | 25% de descuento |
| Monto fijo | Descuento en valor absoluto | $20 de descuento |
| Curso gratis | 100% de descuento | Acceso gratuito |
| Envío gratis | Sin costo de entrega (productos físicos) | Envío 0$ |

#### Configuraciones de Cupón:
- Código (alfanumérico, 4-20 caracteres)
- Tipo y valor de descuento
- Fechas de validez
- Límite de usos total
- Límite de usos por usuario
- Cursos aplicables (todos o específicos)
- Usuarios aplicables (todos o segmentados)
- Uso combinado con otras ofertas

### 8.2.2 Programa de Afiliados

#### Estructura de Comisiones:

| Nivel | Requisito | Comisión | Descripción |
|-------|-----------|----------|-------------|
| Bronce | 0-10 ventas | 20% | Afiliado nuevo |
| Plata | 11-50 ventas | 25% | Afiliado activo |
| Oro | 51-100 ventas | 30% | Afiliado destacado |
| Platino | 100+ ventas | 35% | Afiliado top |

#### Funcionalidades para Afiliados:
- Dashboard personal con estadísticas
- Links de referido únicos
- Códigos de cupón personalizados
- Materiales promocionales (banners, emails)
- Tracking de conversiones
- Pagos automáticos/semi-automáticos
- Reportes de rendimiento

### 8.2.3 Funnels de Venta

```
FUNNEL TÍPICO DE CONVERSIÓN

┌─────────────────┐
│   AWARENESS     │ ← Landing page, anuncios, redes sociales
│   (Visitantes)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│   INTEREST      │ ← Lead magnet gratuito, webinar
│   (Leads)       │
└────────┬────────┘
         ▼
┌─────────────────┐
│   CONSIDERATION │ ← Email nurturing, contenido de valor
│   (Prospectos)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│   CONVERSION    │ ← Oferta especial, urgencia, garantía
│   (Compradores) │
└────────┬────────┘
         ▼
┌─────────────────┐
│   RETENTION     │ ← Upsells, comunidad, nuevo contenido
│   (Clientes)    │
└─────────────────┘
```

### 8.2.4 Email Marketing Integrado

#### Tipos de Emails Automáticos:

| Trigger | Email | Timing |
|---------|-------|--------|
| Registro | Bienvenida | Inmediato |
| Abandono de carrito | Recuperación | 1 hora después |
| Compra | Confirmación + Acceso | Inmediato |
| Inactividad | Re-engagement | 7 días sin actividad |
| Progreso 50% | Motivación | Al alcanzar 50% |
| Finalización | Felicitación + Certificado | Al completar |
| Aniversario | Agradecimiento | 1 año después |

#### Segmentación:
- Por curso inscrito
- Por progreso
- Por última actividad
- Por compras previas
- Por ubicación geográfica
- Por comportamiento

### 8.2.5 Páginas de Venta (Sales Pages)

#### Elementos Configurables:
- Hero section con video/imagen
- Descripción del curso
- Perfil del instructor
- Testimonios
- Módulos y contenido
- Precio y garantía
- FAQ
- CTA (Call to Action)
- Timer de urgencia (opcional)
- Contador de estudiantes

## 8.3 Flujos de Usuario Principales

### Flujo 1: Crear Campaña de Cupones
```
1. Acceder a Marketing → Cupones → 2. Clic en "Crear Cupón" →
3. Configurar código y descuento → 4. Definir validez y límites →
5. Seleccionar cursos aplicables → 6. Guardar y activar →
7. Promocionar código en canales externos
```

### Flujo 2: Gestionar Programa de Afiliados
```
1. Configurar programa (comisiones, términos) → 2. Invitar afiliados →
3. Aprobar solicitudes → 4. Proporcionar materiales →
5. Monitorear rendimiento → 6. Procesar pagos → 7. Optimizar programa
```

### Flujo 3: Configurar Secuencia de Emails
```
1. Crear nueva secuencia → 2. Definir trigger inicial →
3. Diseñar emails individuales → 4. Configurar delays entre emails →
5. Establecer condiciones de salida → 6. Activar secuencia →
7. Monitorear métricas (open rate, CTR)
```

## 8.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-MKT-001 | Crear cupón de descuento | Autor | Generar código promocional |
| CU-MKT-002 | Configurar programa de afiliados | Admin | Establecer comisiones |
| CU-MKT-003 | Invitar afiliado | Admin | Agregar al programa |
| CU-MKT-004 | Crear secuencia de emails | Autor | Automatización de marketing |
| CU-MKT-005 | Diseñar landing page | Autor | Página de ventas |
| CU-MKT-006 | Configurar upsell | Autor | Oferta post-compra |
| CU-MKT-007 | Crear lead magnet | Autor | Contenido gratuito |
| CU-MKT-008 | Gestionar testimonios | Autor | Social proof |
| CU-MKT-009 | Configurar remarketing | Admin | Seguimiento de visitantes |
| CU-MKT-010 | Analizar funnel de conversión | Autor | Optimización |

## 8.5 Reglas de Negocio

- **RN-MKT-001**: Los cupones no son acumulables (salvo configuración especial)
- **RN-MKT-002**: Los afiliados reciben comisión después del período de reembolso
- **RN-MKT-003**: El pago mínimo a afiliados es $50
- **RN-MKT-004**: Los emails automáticos respetan preferencias de usuario
- **RN-MKT-005**: Las páginas de venta deben incluir términos y condiciones
- **RN-MKT-006**: Las ofertas con tiempo limitado deben mostrar contador real
- **RN-MKT-007**: Los testimonios requieren consentimiento del autor
- **RN-MKT-008**: El spam está prohibido y puede resultar en suspensión

---

# 9. SISTEMA DE REPORTES Y ANÁLISIS

## 9.1 Descripción General

Plataforma de business intelligence que proporciona insights detallados sobre el rendimiento de cursos, comportamiento de estudiantes y métricas de negocio.

## 9.2 Funcionalidades Principales

### 9.2.1 Reportes de Ingresos

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORTE DE INGRESOS                                            │
├─────────────────────────────────────────────────────────────────┤
│  Período: [Últimos 30 días ▼]  [Personalizado]                 │
│  Comparar con: [Período anterior ▼]                            │
├─────────────────────────────────────────────────────────────────┤
│  INGRESOS TOTALES                                               │
│  $45,230    ↑ 23.5% vs período anterior                        │
│                                                                 │
│  [Gráfico de líneas: Ingresos diarios]                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  DESGLOSE POR FUENTE                                            │
│  Ventas directas:    $32,450 (72%)                              │
│  Afiliados:          $8,200 (18%)                               │
│  Suscripciones:      $4,580 (10%)                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  TOP CURSOS POR INGRESOS                                        │
│  1. Marketing Digital    $12,400                               │
│  2. Python Avanzado      $8,900                                │
│  3. Diseño UX/UI         $6,500                                │
├─────────────────────────────────────────────────────────────────┤
│  [Exportar CSV]  [Exportar PDF]  [Programar Reporte]           │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2.2 Reportes de Estudiantes

| Métrica | Descripción | Cálculo |
|---------|-------------|---------|
| Total de estudiantes | Usuarios registrados | COUNT(users) |
| Estudiantes activos | Con actividad reciente | COUNT(active_last_30d) |
| Tasa de retención | % que continúan después de 30 días | (Retained / Total) * 100 |
| Tasa de finalización | % que completan cursos | (Completed / Enrolled) * 100 |
| Tiempo promedio de estudio | Horas por estudiante | SUM(time) / COUNT(students) |
| NPS (Net Promoter Score) | Satisfacción general | % Promoters - % Detractors |

### 9.2.3 Reportes de Cursos

#### Métricas por Curso:
- Inscripciones totales
- Ingresos generados
- Tasa de finalización
- Tiempo promedio de finalización
- Rating promedio
- Número de reseñas
- Tasa de conversión (visitas → compras)
- Tasa de reembolso
- Engagement (interacciones por lección)

### 9.2.4 Reportes de Engagement

```
HEATMAP DE ENGAGEMENT POR LECCIÓN

Curso: Marketing Digital (1,234 estudiantes)

Módulo 1: Introducción
├── Lección 1.1: Bienvenida          ████████████████████ 95%
├── Lección 1.2: Objetivos           ███████████████████░ 90%
└── Lección 1.3: ¿Qué aprenderás?    ██████████████████░░ 88%

Módulo 2: Fundamentos
├── Lección 2.1: Conceptos básicos   █████████████████░░░ 85%
├── Lección 2.2: Ejercicio práctico  ███████████████░░░░░ 75%
└── Evaluación: Quiz                 ██████████████░░░░░░ 70%

Módulo 3: Estrategias Avanzadas
├── Lección 3.1: Tácticas pro        ████████████░░░░░░░░ 60% ⚠️
├── Lección 3.2: Casos de estudio    ██████████░░░░░░░░░░ 50% ⚠️
└── Lección 3.3: Implementación      ████████░░░░░░░░░░░░ 40% 🚨

⚠️ = Atención requerida  🚨 = Revisión urgente
```

### 9.2.5 Reportes Programados

- Diarios (enviados cada mañana)
- Semanales (resumen de la semana)
- Mensuales (reporte ejecutivo)
- Personalizados (según configuración)

## 9.3 Flujos de Usuario Principales

### Flujo 1: Generar Reporte Personalizado
```
1. Acceder a sección Reportes → 2. Seleccionar tipo de reporte →
3. Configurar filtros (fecha, curso, métricas) → 4. Aplicar filtros →
5. Visualizar resultados → 6. Opcional: Guardar configuración →
7. Exportar o programar envío
```

### Flujo 2: Analizar Deserción
```
1. Acceder a Reporte de Estudiantes → 2. Filtrar por "Inactivos" →
3. Identificar punto de abandono → 4. Analizar patrones →
5. Generar insights → 6. Crear campaña de re-engagement
```

### Flujo 3: Comparar Rendimiento de Cursos
```
1. Seleccionar múltiples cursos → 2. Elegir métricas de comparación →
3. Visualizar gráficos comparativos → 4. Identificar mejores/peores →
5. Exportar análisis → 6. Tomar decisiones de mejora
```

## 9.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-RPT-001 | Ver reporte de ingresos | Admin/Autor | Análisis financiero |
| CU-RPT-002 | Analizar engagement | Autor | Métricas de interacción |
| CU-RPT-003 | Exportar datos | Admin | Descargar para análisis externo |
| CU-RPT-004 | Programar reporte | Admin | Envío automático periódico |
| CU-RPT-005 | Comparar períodos | Admin | Análisis de crecimiento |
| CU-RPT-006 | Identificar cursos problemáticos | Autor | Detección de bajo rendimiento |
| CU-RPT-007 | Analizar cohortes | Admin | Comportamiento por grupo |
| CU-RPT-008 | Ver mapa de calor de progreso | Autor | Visualización de engagement |
| CU-RPT-009 | Calcular LTV de estudiante | Admin | Lifetime value |
| CU-RPT-010 | Generar reporte de afiliados | Admin | Rendimiento de partners |

## 9.5 Reglas de Negocio

- **RN-RPT-001**: Los datos se actualizan en tiempo real para métricas principales
- **RN-RPT-002**: Los reportes históricos se mantienen por 3 años
- **RN-RPT-003**: La exportación CSV está limitada a 10,000 filas
- **RN-RPT-004**: Los reportes programados se envían a emails verificados
- **RN-RPT-005**: Los datos de estudiantes se anonimizan en reportes agregados
- **RN-RPT-006**: Las métricas de ingresos incluyen reembolsos descontados
- **RN-RPT-007**: El tiempo de estudio se calcula solo en sesiones activas (>5 min)
- **RN-RPT-008**: Los reportes de afiliados se generan mensualmente

---

# 10. PERSONALIZACIÓN DE MARCA

## 10.1 Descripción General

Sistema de white-labeling que permite personalizar la apariencia y experiencia de la plataforma para reflejar la identidad de marca del creador o institución.

## 10.2 Funcionalidades Principales

### 10.2.1 Personalización Visual

#### Elementos Personalizables:

| Elemento | Opciones | Nivel |
|----------|----------|-------|
| Logo | Imagen SVG/PNG, versión clara/oscura | Básico |
| Favicon | Icono de navegador | Básico |
| Colores primarios | Color principal de marca | Básico |
| Colores secundarios | Acentos y complementarios | Básico |
| Tipografía | Familias de fuentes | Avanzado |
| Fondos | Imágenes, colores, gradientes | Avanzado |
| Botones | Estilos, esquinas, sombras | Avanzado |
| Formularios | Estilos de inputs | Avanzado |

#### Configuración de Tema:

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONALIZACIÓN DE MARCA                                       │
├─────────────────────────────────────────────────────────────────┤
│  LOGO Y FAVICON                                                 │
│  Logo principal:    [📷 Subir imagen]  [Vista previa]          │
│  Logo footer:       [📷 Subir imagen]  [Vista previa]          │
│  Favicon:           [📷 Subir imagen]  [Vista previa]          │
├─────────────────────────────────────────────────────────────────┤
│  COLORES DE MARCA                                               │
│  Color primario:    [ ████████ #4F46E5 ]                       │
│  Color secundario:  [ ████████ #10B981 ]                       │
│  Color de acento:   [ ████████ #F59E0B ]                       │
│  Color de texto:    [ ████████ #1F2937 ]                       │
│  Fondo principal:   [ ████████ #FFFFFF ]                       │
├─────────────────────────────────────────────────────────────────┤
│  TIPOGRAFÍA                                                     │
│  Fuente headings:   [ Inter ▼ ]                                │
│  Fuente body:       [ Open Sans ▼ ]                            │
│  Tamaño base:       [ 16 ] px                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Restaurar predeterminado]  [Guardar cambios]                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2.2 Dominio Personalizado

#### Configuración:
- Dominio propio (cursos.tumarca.com)
- Subdominio gratuito (tumarca.learnworlds.com)
- SSL gratuito incluido
- Configuración DNS guiada
- Redirección HTTP → HTTPS

### 10.2.3 Páginas Personalizables

| Página | Elementos Editables |
|--------|---------------------|
| Homepage | Hero, cursos destacados, testimonios, CTA |
| Página de curso | Layout, elementos visibles, orden |
| Página de lección | Sidebar, navegación, branding |
| Login/Registro | Logo, colores, campos adicionales |
| Checkout | Elementos de confianza, campos |
| Footer | Links, redes sociales, copyright |
| 404 | Mensaje personalizado, navegación |

### 10.2.4 Plantillas de Diseño

#### Plantillas Disponibles:

| Plantilla | Estilo | Ideal para |
|-----------|--------|------------|
| Clásica | Elegante, tradicional | Instituciones educativas |
| Moderna | Minimalista, limpia | Creadores individuales |
| Vibrante | Colores vivos, energética | Cursos creativos |
| Profesional | Corporativa, seria | B2B, capacitación |
| Académica | Formal, estructurada | Universidades |

### 10.2.5 CSS Personalizado

Para usuarios avanzados:
- Editor CSS en vivo
- Preview de cambios
- Validación de código
- Scope limitado (no afecta funcionalidad)
- Backup de cambios

## 10.3 Flujos de Usuario Principales

### Flujo 1: Configurar Marca desde Cero
```
1. Acceder a Configuración → Marca → 2. Subir logo y favicon →
3. Seleccionar/colorear paleta de colores → 4. Elegir tipografías →
5. Personalizar páginas principales → 6. Configurar dominio →
7. Previsualizar cambios → 8. Publicar personalización
```

### Flujo 2: Cambiar Plantilla
```
1. Acceder a Biblioteca de Plantillas → 2. Explorar opciones disponibles →
3. Previsualizar plantilla → 4. Aplicar plantilla →
5. Personalizar elementos específicos → 6. Guardar cambios
```

### Flujo 3: Configurar Dominio Propio
```
1. Acceder a Configuración → Dominio → 2. Ingresar dominio deseado →
3. Sistema verifica disponibilidad → 4. Proporciona registros DNS →
5. Usuario configura DNS en su proveedor → 6. Sistema valida configuración →
7. SSL se genera automáticamente → 8. Dominio activo
```

## 10.4 Casos de Uso Específicos

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| CU-BRN-001 | Subir logo de marca | Admin | Personalizar identidad visual |
| CU-BRN-002 | Configurar colores | Admin | Aplicar paleta de marca |
| CU-BRN-003 | Cambiar tipografía | Admin | Seleccionar fuentes |
| CU-BRN-004 | Configurar dominio propio | Admin | URL personalizada |
| CU-BRN-005 | Personalizar homepage | Admin | Editar página principal |
| CU-BRN-006 | Aplicar plantilla | Admin | Usar diseño predefinido |
| CU-BRN-007 | Agregar CSS personalizado | Admin | Estilos avanzados |
| CU-BRN-008 | Configurar email transaccional | Admin | Emails con marca |
| CU-BRN-009 | Personalizar certificados | Admin | Diseño de diplomas |
| CU-BRN-010 | Configurar idioma | Admin | Localización |

## 10.5 Reglas de Negocio

- **RN-BRN-001**: El logo debe ser mínimo 200x200px, formato PNG o SVG
- **RN-BRN-002**: Los colores deben cumplir estándares de accesibilidad WCAG
- **RN-BRN-003**: El dominio personalizado requiere verificación de propiedad
- **RN-BRN-004**: El CSS personalizado no puede sobrescribir clases críticas
- **RN-BRN-005**: Las plantillas son responsivas por defecto
- **RN-BRN-006**: El branding "Powered by" puede ocultarse en planes superiores
- **RN-BRN-007**: Los cambios se aplican inmediatamente (sin cache)
- **RN-BRN-008**: Se mantiene historial de versiones de personalización

---

# RESUMEN DE REQUISITOS

## Matriz de Prioridades

| Módulo | Prioridad | Complejidad | Impacto |
|--------|-----------|-------------|---------|
| Dashboard | Alta | Media | Alto |
| Gestión de Cursos | Alta | Alta | Crítico |
| Constructor de Contenido | Alta | Alta | Crítico |
| Gestión de Estudiantes | Alta | Media | Alto |
| Autenticación | Alta | Media | Crítico |
| Contenido Multimedia | Alta | Alta | Alto |
| Precios y Acceso | Alta | Media | Alto |
| Marketing | Media | Media | Medio |
| Reportes | Media | Alta | Medio |
| Personalización | Media | Media | Medio |

## Dependencias entre Módulos

```
AUTENTICACIÓN
     │
     ├──→ GESTIÓN DE ESTUDIANTES
     │         │
     │         └──→ DASHBOARD
     │
     ├──→ GESTIÓN DE CURSOS
     │         │
     │         ├──→ CONSTRUCTOR DE CONTENIDO
     │         │         │
     │         │         └──→ CONTENIDO MULTIMEDIA
     │         │
     │         └──→ PRECIOS Y ACCESO
     │                   │
     │                   └──→ MARKETING
     │
     └──→ REPORTES ←──────┘
                │
                └──→ PERSONALIZACIÓN
```

---

## GLOSARIO

| Término | Definición |
|---------|------------|
| **LMS** | Learning Management System - Sistema de gestión de aprendizaje |
| **SCORM** | Shareable Content Object Reference Model - Estándar de contenido e-learning |
| **xAPI** | Experience API (Tin Can) - Protocolo para rastrear experiencias de aprendizaje |
| **WYSIWYG** | What You See Is What You Get - Editor visual |
| **SSO** | Single Sign-On - Autenticación única |
| **2FA/MFA** | Two/Multi-Factor Authentication - Autenticación de dos o más factores |
| **JWT** | JSON Web Token - Token de autenticación |
| **CDN** | Content Delivery Network - Red de distribución de contenido |
| **LTV** | Lifetime Value - Valor de vida del cliente |
| **NPS** | Net Promoter Score - Métrica de satisfacción |
| **AOV** | Average Order Value - Valor promedio de orden |
| **CTR** | Click-Through Rate - Tasa de clics |
| **GDPR** | General Data Protection Regulation - Regulación de protección de datos UE |
| **LGPD** | Lei Geral de Proteção de Dados - Ley de protección de datos Brasil |
| **WCAG** | Web Content Accessibility Guidelines - Guías de accesibilidad web |

---

*Documento generado como análisis funcional completo para plataforma LMS tipo LearnWorlds*
*Versión 1.0 - 2024*
