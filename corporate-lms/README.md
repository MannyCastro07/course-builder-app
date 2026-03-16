# Corporate LMS - Simplified Course Builder

A streamlined Learning Management System designed for internal corporate training. Built with React, TypeScript, and Tailwind CSS.

## Features

### Core Features
- **Course Builder** - Intuitive drag-and-drop interface for creating courses
- **Content Types** - Support for text, video, documents, quizzes, and code
- **Preview Mode** - See exactly how learners will view your courses
- **Progress Tracking** - Track learner progress and completion
- **Role-based Access** - Admin, Instructor, and Learner roles

### What's Included
- ✅ Dashboard with stats and recent activity
- ✅ Course creation and management
- ✅ Section and lesson organization
- ✅ Rich text editor
- ✅ Video upload and embedding
- ✅ Quiz builder
- ✅ File uploads
- ✅ Progress tracking
- ✅ Responsive design

### What's NOT Included (Simplified)
- ❌ Payments or subscriptions
- ❌ Multi-tenancy
- ❌ Advanced marketing tools
- ❌ Affiliate system
- ❌ Complex pricing models

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
corporate-lms/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components (Button, Input, Card, etc.)
│   │   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   │   ├── course-builder/  # Course builder specific components
│   │   └── common/          # Shared components (StatCard, DataTable, etc.)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Courses.tsx
│   │   ├── CourseBuilder.tsx
│   │   ├── MyCourses.tsx
│   │   └── LearnCourse.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCourses.ts
│   │   └── useEnrollments.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── courseBuilderStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── courseService.ts
│   │   └── enrollmentService.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── index.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd corporate-lms/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Usage Guide

### For Instructors

1. **Create a Course**
   - Go to "Course Builder"
   - Click "Create Course"
   - Add sections and lessons
   - Use the content library to add different types of content

2. **Add Content**
   - **Text**: Use the rich text editor
   - **Video**: Upload or paste URL (YouTube/Vimeo)
   - **Document**: Upload PDF, Word, or PowerPoint
   - **Quiz**: Create multiple choice questions
   - **Code**: Add code snippets

3. **Preview Course**
   - Click "Preview" to see the learner view
   - Test all content before publishing

4. **Publish**
   - Save your course
   - Change status to "Published"
   - Learners can now enroll

### For Learners

1. **Browse Courses**
   - Go to "All Courses"
   - View available courses
   - Enroll in interesting courses

2. **Learn**
   - Go to "My Learning"
   - Continue where you left off
   - Track your progress
   - Complete lessons and quizzes

3. **Earn Certificates**
   - Complete all lessons
   - Pass quizzes
   - Download certificates

## API Integration

The frontend expects a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/publish` - Publish course
- `POST /api/courses/:id/unpublish` - Unpublish course

### Content
- `GET /api/courses/:id/sections` - Get sections
- `POST /api/courses/:id/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

- `GET /api/sections/:id/lessons` - Get lessons
- `POST /api/sections/:id/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Enrollments
- `GET /api/enrollments` - My enrollments
- `POST /api/courses/:id/enroll` - Enroll
- `GET /api/courses/:id/progress` - Get progress
- `POST /api/lessons/:id/complete` - Mark lesson complete

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:

```js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ...
  },
}
```

### Logo
Replace the logo in `src/components/layout/Sidebar.tsx`

### Company Name
Update the company name in:
- `src/components/layout/Sidebar.tsx`
- `src/pages/Login.tsx`
- `index.html`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use for your organization!

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
