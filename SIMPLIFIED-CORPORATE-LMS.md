# Simplified Corporate LMS - Course Builder Platform
## Internal Training Platform for Single Organization

---

## 📋 OVERVIEW

A streamlined course creation and delivery platform designed for internal corporate training. No payments, no subscriptions - just a powerful course builder and learning experience.

### Key Characteristics
- **Single Organization**: One company, no multi-tenancy
- **Internal Use Only**: Employee training and development
- **No Monetization**: No payments, subscriptions, or pricing
- **Course Builder Focus**: Rich content creation tools
- **Preview Mode**: See courses as learners see them
- **English Only**: Full English interface

---

## 🎯 CORE FEATURES

### 1. Authentication & User Management
- Simple email/password login
- Role-based access: Admin, Instructor, Learner
- Employee self-registration or admin invitation
- Profile management

### 2. Dashboard
- **Instructor Dashboard**:
  - Courses created
  - Total learners enrolled
  - Completion rates
  - Recent activity
  
- **Learner Dashboard**:
  - My courses (in progress, completed, not started)
  - Progress overview
  - Continue learning
  - Achievements/certificates

- **Admin Dashboard**:
  - Platform overview
  - User management
  - Course analytics
  - System settings

### 3. Course Builder (PRIORITY FEATURE)

#### Course Structure
```
Course
├── Course Info
│   ├── Title, description, thumbnail
│   ├── Category/Department
│   ├── Estimated duration
│   └── Target audience
│
├── Sections (Modules)
│   ├── Section 1: Introduction
│   │   ├── Lesson 1.1: Welcome
│   │   ├── Lesson 1.2: Objectives
│   │   └── Lesson 1.3: Prerequisites
│   │
│   ├── Section 2: Core Content
│   │   ├── Lesson 2.1: Topic A
│   │   ├── Lesson 2.2: Topic B
│   │   ├── Lesson 2.3: Hands-on Exercise
│   │   └── Lesson 2.4: Quiz
│   │
│   └── Section N: Conclusion
│       ├── Lesson N.1: Summary
│       ├── Lesson N.2: Final Assessment
│       └── Lesson N.3: Next Steps
│
└── Settings
    ├── Publish status (Draft/Published)
    ├── Enrollment (Open/Restricted/Invite-only)
    ├── Completion certificate
    └── Prerequisites
```

#### Content Types
| Type | Description |
|------|-------------|
| **Video** | Upload or embed (YouTube/Vimeo), with transcripts |
| **Text** | Rich text editor with formatting, images, links |
| **Document** | PDF, PowerPoint, Word downloads |
| **Quiz** | Multiple choice, true/false, short answer |
| **Assignment** | File upload submissions with review |
| **Interactive** | Embeddable content (H5P, SCORM) |
| **Code** | Code snippets with syntax highlighting |

#### Builder Interface
- **Three-panel layout**:
  - Left: Course structure (sections/lessons tree)
  - Center: Content editor canvas
  - Right: Content type library

- **Drag & Drop**:
  - Reorder sections
  - Reorder lessons within sections
  - Drag content blocks into lessons

- **Rich Text Editor**:
  - Formatting toolbar
  - Image insertion
  - Link embedding
  - Tables
  - HTML editing mode

### 4. Preview Mode
- **Toggle**: Switch between "Edit" and "Preview" modes
- **Learner View**: See exactly what learners will see
- **Responsive Preview**: Desktop, tablet, mobile views
- **Progress Simulation**: Test progress tracking

### 5. Course Management
- Create, edit, duplicate, delete courses
- Publish/unpublish courses
- Course categories/tags
- Course thumbnail and banner images
- SEO-friendly URLs

### 6. Enrollment & Access
- **Open Enrollment**: Anyone can join
- **Restricted**: Requires approval
- **Invite-only**: Specific email invitations
- **Auto-enroll**: Based on department/role

### 7. Progress Tracking
- Lesson completion tracking
- Progress percentage per course
- Time spent
- Quiz scores
- Assignment submissions
- Certificates of completion

### 8. Reporting (Basic)
- Course completion rates
- Learner progress reports
- Quiz/assessment results
- Time spent analytics
- Export to CSV

---

## 🏗️ SIMPLIFIED ARCHITECTURE

### Tech Stack (Lightweight)

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | Zustand + React Query |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL |
| **File Storage** | Local filesystem or AWS S3 |
| **Video** | Simple upload + streaming (no transcoding needed for small scale) |

### Database Schema (Simplified)

```sql
-- Users
users (id, email, password_hash, first_name, last_name, role, department, avatar, created_at)

-- Courses
courses (id, title, description, thumbnail, instructor_id, status, category, duration, created_at)

-- Sections
sections (id, course_id, title, position, created_at)

-- Lessons
lessons (id, section_id, title, content_type, content, video_url, duration, position, is_preview, created_at)

-- Enrollments
enrollments (id, user_id, course_id, status, progress, enrolled_at, completed_at)

-- Progress
lesson_progress (id, enrollment_id, lesson_id, completed, completed_at)

-- Quizzes
quizzes (id, lesson_id, title, passing_score)
questions (id, quiz_id, type, content, options, correct_answer, points)
quiz_attempts (id, user_id, quiz_id, score, answers, submitted_at)

-- Assignments
assignments (id, lesson_id, title, description, due_date)
submissions (id, assignment_id, user_id, file_url, comment, submitted_at, grade, feedback)

-- Certificates
certificates (id, user_id, course_id, issued_at, certificate_number, template)
```

---

## 🎨 UI/UX DESIGN

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🎓 Corporate LMS    │  🔍 Search    🔔  👤 John Doe    │  ← Header
│  ────────────────────┼────────────────────────────────────│
│  📊 Dashboard        │                                     │
│  📚 My Courses       │    [Dashboard Content]             │
│  🎓 All Courses      │                                     │  ← Sidebar
│  ✏️ Course Builder   │    [Stats Cards]                   │    (260px)
│  👥 Learners         │    [Charts]                        │
│  📈 Reports          │    [Recent Activity]               │
│  ⚙️ Settings         │                                     │
└─────────────────────────────────────────────────────────────┘
```

### Color Palette (Corporate)

```css
/* Primary - Professional Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-900: #1e3a8a;

/* Neutral */
--neutral-0: #ffffff;
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-500: #64748b;
--neutral-700: #334155;
--neutral-900: #0f172a;

/* Semantic */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #0ea5e9;
```

### Key Screens

#### 1. Login
- Clean, centered login form
- Company logo
- Email + password
- "Forgot password" link

#### 2. Dashboard (Instructor)
- Welcome message
- Quick stats (courses, learners, completion rate)
- Recent courses (with edit buttons)
- Recent activity feed
- "Create New Course" CTA

#### 3. Course Builder
```
┌─────────────────────────────────────────────────────────────┐
│  Course: Leadership Fundamentals          [Save] [Preview] │
├─────────────────┬─────────────────────────┬─────────────────┤
│                 │                         │                 │
│  📁 SECTIONS    │    CONTENT EDITOR       │  + ADD BLOCK    │
│                 │                         │                 │
│  ▼ Introduction │  ┌─────────────────┐   │  [Text]         │
│    ○ Welcome    │  │                 │   │  [Video]        │
│    ○ Objectives │  │  [Edit content  │   │  [Quiz]         │
│                 │  │   here...]      │   │  [Document]     │
│  ▶ Module 1     │  │                 │   │  [Assignment]   │
│  ▶ Module 2     │  └─────────────────┘   │  [Code]         │
│                 │                         │                 │
│  [+ Add Section]│  [Rich Text Toolbar]    │                 │
│                 │                         │                 │
└─────────────────┴─────────────────────────┴─────────────────┘
```

#### 4. Course Preview (Learner View)
- Course header with thumbnail
- Progress bar
- Section/lesson navigation sidebar
- Content area
- "Mark as complete" button
- Previous/Next navigation

#### 5. My Courses (Learner)
- Grid of enrolled courses
- Progress indicators
- "Continue" buttons
- Filter: All, In Progress, Completed

---

## 💻 IMPLEMENTATION

### Project Structure

```
corporate-lms/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Layout, Sidebar, Header
│   │   │   ├── course-builder/  # Course builder components
│   │   │   ├── course-view/     # Course viewing components
│   │   │   └── common/          # Reusable components
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── CourseBuilder.tsx
│   │   │   ├── CoursePreview.tsx
│   │   │   ├── MyLearning.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── content.ts
│   │   │   ├── enrollments.ts
│   │   │   └── uploads.ts
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

### API Endpoints (Simplified)

```
# Auth
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me

# Courses
GET    /api/courses                    # List all (with filters)
POST   /api/courses                    # Create course
GET    /api/courses/:id                # Get course details
PUT    /api/courses/:id                # Update course
DELETE /api/courses/:id                # Delete course
POST   /api/courses/:id/duplicate      # Duplicate course
POST   /api/courses/:id/publish        # Publish course
POST   /api/courses/:id/unpublish      # Unpublish course

# Content (Sections & Lessons)
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

# Enrollments
GET    /api/enrollments                # My enrollments
POST   /api/courses/:id/enroll         # Enroll in course
POST   /api/lessons/:id/complete       # Mark lesson complete
GET    /api/courses/:id/progress       # Get progress

# Uploads
POST   /api/upload/image
POST   /api/upload/video
POST   /api/upload/document
```

---

## 🚀 DEVELOPMENT PLAN

### Phase 1: Foundation (Week 1)
- [ ] Project setup (frontend + backend)
- [ ] Database schema
- [ ] Authentication system
- [ ] Basic layout

### Phase 2: Course Builder Core (Week 2-3)
- [ ] Course CRUD
- [ ] Section management
- [ ] Lesson management
- [ ] Basic content editor (text)
- [ ] Course structure UI

### Phase 3: Rich Content (Week 4)
- [ ] Video upload/embedding
- [ ] File uploads (PDF, docs)
- [ ] Rich text editor
- [ ] Image handling

### Phase 4: Preview & Learning (Week 5)
- [ ] Preview mode toggle
- [ ] Learner course view
- [ ] Progress tracking
- [ ] "Mark as complete"

### Phase 5: Quizzes & Assessments (Week 6)
- [ ] Quiz builder
- [ ] Question types
- [ ] Quiz taking
- [ ] Scoring

### Phase 6: Polish (Week 7)
- [ ] Dashboard enhancements
- [ ] Reporting
- [ ] Search & filters
- [ ] UI/UX improvements

### Phase 7: Testing & Deploy (Week 8)
- [ ] Testing
- [ ] Bug fixes
- [ ] Deployment

---

## ✅ FEATURE CHECKLIST

### Core
- [x] User authentication (email/password)
- [x] Role-based access (Admin, Instructor, Learner)
- [x] Dashboard for each role
- [x] Course CRUD
- [x] Section & Lesson management
- [x] Drag & drop reordering

### Content Builder
- [x] Rich text editor
- [x] Video upload/embed
- [x] Document uploads
- [x] Image insertion
- [x] Code blocks
- [x] Quiz builder

### Learning Experience
- [x] Course catalog
- [x] Course enrollment
- [x] Progress tracking
- [x] Lesson completion
- [x] Course preview mode
- [x] Responsive design

### Admin
- [x] User management
- [x] Course management
- [x] Basic reporting
- [x] Content moderation

### Removed (vs Full LMS)
- [ ] Payments/Subscriptions
- [ ] Coupons
- [ ] Affiliate system
- [ ] Multi-tenancy
- [ ] Advanced marketing tools
- [ ] Complex pricing models

---

## 🎯 SUCCESS CRITERIA

1. **Course Builder**: Instructors can create rich courses in < 30 minutes
2. **Preview Mode**: 100% accurate representation of learner view
3. **Performance**: Pages load in < 2 seconds
4. **Usability**: New user can complete a course without training
5. **Mobile**: Fully functional on mobile devices

---

**Simplified for internal corporate training use**
**English only**
**No payments or subscriptions**
