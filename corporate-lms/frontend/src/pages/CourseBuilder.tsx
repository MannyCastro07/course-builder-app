import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  GripVertical, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Type,
  Video,
  FileText,
  HelpCircle,
  Code,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCourseBuilderStore } from '@/stores/courseBuilderStore';
import { useCourses } from '@/hooks/useCourses';
import { useUIStore } from '@/stores/uiStore';
import { Course, Section, Lesson, ContentType } from '@/types';

const contentTypes: { type: ContentType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
  { type: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { type: 'document', label: 'Document', icon: <FileText className="w-4 h-4" /> },
  { type: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
  { type: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
];

export function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  
  const {
    currentCourse,
    selectedSectionId,
    selectedLessonId,
    isSaving,
    hasUnsavedChanges,
    isPreviewMode,
    setCurrentCourse,
    selectSection,
    selectLesson,
    updateCourse,
    addSection,
    updateSection,
    removeSection,
    addLesson,
    updateLesson,
    removeLesson,
    setIsSaving,
    setHasUnsavedChanges,
    togglePreviewMode,
  } = useCourseBuilderStore();

  const { create, update } = useCourses();
  
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Load course if editing
  useEffect(() => {
    if (courseId) {
      // In real app, fetch course from API
      // For now, we'll create a mock course structure
      const mockCourse: Course = {
        id: courseId,
        title: 'New Course',
        description: '',
        status: 'draft',
        instructorId: '1',
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentCourse(mockCourse);
    } else {
      // Creating new course
      const newCourse: Course = {
        id: 'new',
        title: 'Untitled Course',
        description: '',
        status: 'draft',
        instructorId: '1',
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentCourse(newCourse);
    }
  }, [courseId]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveCourse = async () => {
    if (!currentCourse) return;
    
    setIsSaving(true);
    try {
      if (currentCourse.id === 'new') {
        const created = await create({
          title: currentCourse.title,
          description: currentCourse.description,
        });
        setCurrentCourse({ ...currentCourse, id: created.id });
        addToast('success', 'Course created successfully');
        navigate(`/builder/${created.id}`);
      } else {
        await update({
          id: currentCourse.id,
          data: {
            title: currentCourse.title,
            description: currentCourse.description,
          },
        });
        addToast('success', 'Course saved successfully');
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      addToast('error', 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      courseId: currentCourse?.id || '',
      title: 'New Section',
      position: currentCourse?.sections.length || 0,
      lessons: [],
      createdAt: new Date().toISOString(),
    };
    addSection(newSection);
    setExpandedSections(prev => new Set(prev).add(newSection.id));
    setEditingSectionId(newSection.id);
    setSectionTitle('New Section');
  };

  const handleUpdateSection = (sectionId: string) => {
    if (!sectionTitle.trim()) return;
    updateSection(sectionId, { title: sectionTitle });
    setEditingSectionId(null);
    setSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? All lessons will be lost.')) return;
    removeSection(sectionId);
  };

  const handleAddLesson = (sectionId: string, contentType: ContentType) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      sectionId,
      title: `New ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Lesson`,
      contentType,
      content: '',
      isPreview: false,
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addLesson(sectionId, newLesson);
    setEditingLessonId(newLesson.id);
    setLessonTitle(newLesson.title);
  };

  const handleUpdateLesson = (lessonId: string) => {
    if (!lessonTitle.trim()) return;
    updateLesson(lessonId, { title: lessonTitle });
    setEditingLessonId(null);
    setLessonTitle('');
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    removeLesson(lessonId);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const selectedSection = currentCourse?.sections.find(s => s.id === selectedSectionId);
  const selectedLesson = selectedSection?.lessons.find(l => l.id === selectedLessonId);

  if (isPreviewMode) {
    return <CoursePreview course={currentCourse!} onExitPreview={() => togglePreviewMode()} />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <Input
              value={currentCourse?.title || ''}
              onChange={(e) => updateCourse({ title: e.target.value })}
              className="text-xl font-semibold border-0 bg-transparent p-0 focus:ring-0 placeholder-gray-400"
              placeholder="Course Title"
            />
            <p className="text-sm text-gray-500">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onClick={togglePreviewMode}
          >
            Preview
          </Button>
          <Button
            onClick={handleSaveCourse}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Course
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Course Structure */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Course Structure</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {currentCourse?.sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Section Header */}
                  <div 
                    className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedSectionId === section.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => selectSection(section.id)}
                  >
                    <button onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {editingSectionId === section.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={sectionTitle}
                          onChange={(e) => setSectionTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateSection(section.id);
                            if (e.key === 'Escape') { setEditingSectionId(null); setSectionTitle(''); }
                          }}
                        />
                        <button onClick={() => handleUpdateSection(section.id)}>
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => { setEditingSectionId(null); setSectionTitle(''); }}>
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-gray-900">{section.title}</span>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingSectionId(section.id); 
                            setSectionTitle(section.title); 
                          }}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Lessons */}
                  {expandedSections.has(section.id) && (
                    <div className="border-t border-gray-100">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                            selectedLessonId === lesson.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => selectLesson(lesson.id)}
                        >
                          <GripVertical className="w-4 h-4 text-gray-300" />
                          
                          {editingLessonId === lesson.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateLesson(lesson.id);
                                  if (e.key === 'Escape') { setEditingLessonId(null); setLessonTitle(''); }
                                }}
                              />
                              <button onClick={() => handleUpdateLesson(lesson.id)}>
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-400">
                                {contentTypes.find(ct => ct.type === lesson.contentType)?.icon}
                              </span>
                              <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEditingLessonId(lesson.id); 
                                  setLessonTitle(lesson.title); 
                                }}
                              >
                                <Edit2 className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                              >
                                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {/* Add Lesson Buttons */}
                      <div className="px-4 py-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {contentTypes.map((ct) => (
                            <button
                              key={ct.type}
                              onClick={() => handleAddLesson(section.id, ct.type)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              title={`Add ${ct.label}`}
                            >
                              {ct.icon}
                              <span>{ct.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Section Button */}
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full" 
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddSection}
            >
              Add Section
            </Button>
          </div>
        </div>

        {/* Center - Content Editor */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedLesson ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedLesson.title}</h2>
                    <p className="text-sm text-gray-500">
                      {contentTypes.find(ct => ct.type === selectedLesson.contentType)?.label} Lesson
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedLesson.isPreview}
                        onChange={(e) => updateLesson(selectedLesson.id, { isPreview: e.target.checked })}
                      />
                      Allow preview
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <ContentEditor 
                  lesson={selectedLesson}
                  onUpdate={(content) => updateLesson(selectedLesson.id, { content })}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p>Select a lesson to edit its content</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Content Library */}
        <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Content Library</h3>
          <div className="space-y-2">
            {contentTypes.map((ct) => (
              <div
                key={ct.type}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => selectedSectionId && handleAddLesson(selectedSectionId, ct.type)}
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  {ct.icon}
                </div>
                <span className="font-medium text-gray-700">{ct.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Drag lessons to reorder</li>
              <li>• Use preview mode to test</li>
              <li>• Keep videos under 10 minutes</li>
              <li>• Add quizzes for engagement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Editor Component
function ContentEditor({ lesson, onUpdate }: { lesson: Lesson; onUpdate: (content: string) => void }) {
  const [content, setContent] = useState(lesson.content);

  useEffect(() => {
    setContent(lesson.content);
  }, [lesson.id]);

  const handleChange = (value: string) => {
    setContent(value);
    onUpdate(value);
  };

  switch (lesson.contentType) {
    case 'text':
      return (
        <div className="max-w-3xl mx-auto">
          <RichTextEditor value={content} onChange={handleChange} />
        </div>
      );
    
    case 'video':
      return (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Upload a video or paste a URL</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
                Upload Video
              </Button>
            </div>
          </div>
          <Input
            label="Or paste video URL (YouTube, Vimeo)"
            placeholder="https://..."
            value={content}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );
    
    case 'document':
      return (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Upload a document (PDF, Word, PowerPoint)</p>
            <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
              Upload Document
            </Button>
          </div>
        </div>
      );
    
    case 'quiz':
      return (
        <div className="max-w-3xl mx-auto">
          <QuizBuilder lessonId={lesson.id} />
        </div>
      );
    
    case 'code':
      return (
        <div className="max-w-3xl mx-auto">
          <Textarea
            label="Code Snippet"
            placeholder="Paste your code here..."
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            className="font-mono"
            rows={15}
          />
        </div>
      );
    
    default:
      return <div>Unknown content type</div>;
  }
}

// Rich Text Editor (Simplified)
function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Bold">
          <strong>B</strong>
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Italic">
          <em>I</em>
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Underline">
          <u>U</u>
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Heading">
          H
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded" title="List">
          ≡
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Link">
          🔗
        </button>
        <button className="p-1.5 hover:bg-gray-200 rounded" title="Image">
          🖼️
        </button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing your content..."
        className="border-0 rounded-none min-h-[400px]"
        rows={15}
      />
    </div>
  );
}

// Quiz Builder Component
function QuizBuilder({ lessonId }: { lessonId: string }) {
  const [questions, setQuestions] = useState<any[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      type: 'multiple_choice',
      content: '',
      options: ['', ''],
      correctAnswer: '',
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Quiz Questions</h3>
        <Button onClick={addQuestion} leftIcon={<Plus className="w-4 h-4" />}>
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No questions yet. Add your first question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <Card.Body>
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-gray-500">{index + 1}.</span>
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Question text"
                      value={q.content}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[index].content = e.target.value;
                        setQuestions(updated);
                      }}
                    />
                    <div className="space-y-2">
                      {q.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`q-${q.id}`}
                            className="rounded-full"
                          />
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[index].options[optIndex] = e.target.value;
                              setQuestions(updated);
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const updated = [...questions];
                          updated[index].options.push('');
                          setQuestions(updated);
                        }}
                      >
                        + Add Option
                      </Button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Course Preview Component
function CoursePreview({ course, onExitPreview }: { course: Course; onExitPreview: () => void }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (course.sections.length > 0 && course.sections[0].lessons.length > 0) {
      setActiveLesson(course.sections[0].lessons[0]);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onExitPreview} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">Preview: {course.title}</h2>
            <p className="text-sm text-gray-500">This is how learners will see your course</p>
          </div>
        </div>
        <Button variant="outline" onClick={onExitPreview}>Exit Preview</Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-4">
                {course.sections.map((section, sectionIndex) => (
                  <div key={section.id}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Section {sectionIndex + 1}: {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeLesson?.id === lesson.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{lessonIndex + 1}.</span>
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.isPreview && (
                              <Badge size="sm" variant="info">Preview</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeLesson.title}</h1>
              
              <div className="prose max-w-none">
                {activeLesson.contentType === 'text' && (
                  <div className="whitespace-pre-wrap">{activeLesson.content}</div>
                )}
                {activeLesson.contentType === 'video' && activeLesson.videoUrl && (
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-white">Video Player: {activeLesson.videoUrl}</p>
                  </div>
                )}
                {activeLesson.contentType === 'code' && (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{activeLesson.content}</code>
                  </pre>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
                <Button variant="outline">Previous</Button>
                <Button>Mark as Complete</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a lesson to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
