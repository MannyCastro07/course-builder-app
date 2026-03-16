import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { useCourse } from '@/hooks/useCourses';
import { useCourseProgress, useMyEnrollments } from '@/hooks/useEnrollments';
import { useAuth } from '@/hooks/useAuth';
import { Lesson, ContentType } from '@/types';

export function LearnCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { course, isLoading: courseLoading } = useCourse(courseId!);
  const { progress, completeLesson, isLoading: progressLoading } = useCourseProgress(courseId!);
  const { enroll } = useMyEnrollments();
  
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Auto-enroll if not enrolled
  useEffect(() => {
    if (course && user) {
      // Check if enrolled (in real app, check from enrollments data)
      setIsEnrolled(true);
    }
  }, [course, user]);

  // Set first lesson as active
  useEffect(() => {
    if (course && !activeLesson) {
      const firstLesson = course.sections?.[0]?.lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [course]);

  const handleEnroll = async () => {
    try {
      await enroll(courseId!);
      setIsEnrolled(true);
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    try {
      await completeLesson(activeLesson.id);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!course || !activeLesson) return null;
    
    let found = false;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (found) return lesson;
        if (lesson.id === activeLesson.id) found = true;
      }
    }
    return null;
  };

  const getPrevLesson = (): Lesson | null => {
    if (!course || !activeLesson) return null;
    
    let prev: Lesson | null = null;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === activeLesson.id) return prev;
        prev = lesson;
      }
    }
    return null;
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-8">{course.description}</p>
          <Button onClick={handleEnroll} size="lg">
            Enroll Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="font-semibold text-gray-900 truncate max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600">Your Progress</span>
            <Progress value={progress?.progress || 0} size="sm" className="w-32" showLabel />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Course Content */}
        {sidebarOpen && (
          <aside className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="mb-4">
                <Progress value={progress?.progress || 0} size="sm" showLabel />
                <p className="text-sm text-gray-600 mt-1">
                  {progress?.completedLessons?.length || 0} of {progress?.totalLessons || 0} lessons completed
                </p>
              </div>

              <div className="space-y-4">
                {course.sections?.map((section, sectionIndex) => (
                  <div key={section.id}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 px-2">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className={isCompleted ? 'text-green-500' : 'text-gray-400'}>
                              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </span>
                            <span className="text-gray-400">{getContentIcon(lesson.contentType)}</span>
                            <span className="flex-1 truncate">{lesson.title}</span>
                            {lesson.isPreview && (
                              <Badge size="sm" variant="info">Free</Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>{activeLesson.title}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h1>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                {activeLesson.contentType === 'video' && activeLesson.videoUrl && (
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                      <p>Video Player</p>
                      <p className="text-sm text-gray-400">{activeLesson.videoUrl}</p>
                    </div>
                  </div>
                )}

                {activeLesson.contentType === 'text' && (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {activeLesson.content || 'No content yet'}
                  </div>
                )}

                {activeLesson.contentType === 'code' && (
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                    <code>{activeLesson.content || '// No code yet'}</code>
                  </pre>
                )}

                {activeLesson.contentType === 'quiz' && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Quiz</h3>
                    <p className="text-gray-600">Quiz questions will appear here</p>
                  </div>
                )}

                {activeLesson.contentType === 'document' && (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Document download will appear here</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
                <Button
                  variant="outline"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() => {
                    const prev = getPrevLesson();
                    if (prev) setActiveLesson(prev);
                  }}
                  disabled={!getPrevLesson()}
                >
                  Previous
                </Button>

                {!isLessonCompleted(activeLesson.id) && (
                  <Button
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={handleCompleteLesson}
                  >
                    Mark as Complete
                  </Button>
                )}

                <Button
                  variant="outline"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => {
                    const next = getNextLesson();
                    if (next) setActiveLesson(next);
                  }}
                  disabled={!getNextLesson()}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a lesson to start learning</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
