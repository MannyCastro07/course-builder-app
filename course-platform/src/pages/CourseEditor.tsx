import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUIStore, useCourseStore } from '@/stores';
import { useCourse } from '@/hooks';
import { Button, Input, Textarea, Badge, Card } from '@/components/ui';
import { FileUpload } from '@/components/common/FileUpload';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  Save,
  Eye,
  Plus,
  GripVertical,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  FileText,
  HelpCircle,
  Trash2,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  BookOpen,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { cn } from '@/utils';
import type { Section, Lesson, Attachment } from '@/types';
import { createAttachmentFromUpload } from '@/utils/lessonContent';
import type { UploadResult } from '@/services/storageService';

// Sortable Section Item
function SortableSection({ section, index, isExpanded, onToggle }: { section: Section; index: number; isExpanded: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const { selectedSection, selectSection, deleteSection } = useCourseStore();
  const isSelected = selectedSection?.id === section.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    soon: 'bg-amber-50 text-amber-600 border-amber-100',
    free: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    paid: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white border rounded-xl shadow-sm transition-all hover:shadow-md',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-4 p-4 cursor-pointer',
          isSelected && 'bg-primary/5 rounded-t-xl'
        )}
        onClick={() => selectSection(section)}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
        
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 truncate">{section.title}</span>
            <Badge variant="outline" className={cn('text-[10px] h-4 leading-none px-1.5', statusColors[section.accessStatus || 'draft'])}>
              {(section.accessStatus || 'draft').toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {section.lessons.length} {section.lessons.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
            className="p-1.5 hover:bg-destructive/10 rounded-md text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-slate-50/50 p-4 pt-2 rounded-b-xl">
          <LessonList sectionId={section.id} lessons={section.lessons} />
        </div>
      )}
    </div>
  );
}

// Activity Creation Modal
function ActivityModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: Lesson['type']) => void;
}) {
  const categories = [
    {
      title: 'Multimedia',
      activities: [
        { type: 'video', label: 'Video Lesson', icon: PlayCircle, description: 'Upload a video file or paste an external video URL' },
        { type: 'text', label: 'Text Lesson', icon: FileText, description: 'Write lesson text directly inside the editor' },
        { type: 'pdf', label: 'PDF Lesson', icon: FileText, description: 'Attach a PDF file for reading or download' },
        { type: 'download', label: 'Document Lesson', icon: FileText, description: 'Attach DOC, DOCX, TXT, RTF, or ODT files' },
        { type: 'image', label: 'Image Gallery', icon: FileText, description: 'Upload one or more images' },
      ],
    },
    {
      title: 'Questionnaire',
      activities: [
        { type: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Multiple choice questions' },
        { type: 'assignment', label: 'Assignment', icon: FileText, description: 'Student submission task' },
      ],
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Learning Activity</SheetTitle>
          <SheetDescription>
            Select the type of activity you want to add to this section.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {categories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="grid gap-3">
                {category.activities.map((activity) => (
                  <button
                    key={activity.type}
                    onClick={() => onSelect(activity.type as any)}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-white hover:border-primary hover:shadow-sm transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{activity.label}</div>
                      <div className="text-xs text-muted-foreground">{activity.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Lesson List
function LessonList({ sectionId, lessons }: { sectionId: string; lessons: Lesson[] }) {
  const { selectedLesson, selectLesson, addLesson, reorderLessons } = useCourseStore();
  const [isActivityModalOpen, setIsActivityModalOpen] = React.useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over?.id);
      const newOrder = arrayMove(lessons, oldIndex, newIndex).map((l) => l.id);
      reorderLessons(sectionId, newOrder);
    }
  };

  const handleAddActivity = (type: Lesson['type']) => {
    addLesson(sectionId, {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      duration: 0,
      isPreview: false,
      attachments: [],
    });
    setIsActivityModalOpen(false);
  };

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {lessons.map((lesson) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              isSelected={selectedLesson?.id === lesson.id}
              onClick={() => selectLesson(lesson)}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 border border-dashed mt-2"
        onClick={() => setIsActivityModalOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Activity
      </Button>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSelect={handleAddActivity}
      />
    </div>
  );
}

// Sortable Lesson Item
function SortableLesson({ lesson, isSelected, onClick }: { lesson: Lesson; isSelected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const { deleteLesson } = useCourseStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getLessonIcon = () => {
    switch (lesson.type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg text-sm cursor-pointer transition-all',
        isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-white hover:shadow-sm text-slate-600'
      )}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3 text-slate-400" />
      </div>
      <div className={cn('p-1.5 rounded-md', isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400')}>
        {getLessonIcon()}
      </div>
      <span className="flex-1 truncate">{lesson.title}</span>
      <div className="flex items-center gap-2">
        {lesson.videoUrl && <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-500 border-blue-100">VIDEO</Badge>}
        {(lesson.type === 'pdf' || lesson.type === 'download') && lesson.attachments.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-4 bg-amber-50 text-amber-700 border-amber-100">FILE</Badge>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}
          className="p-1 hover:bg-destructive/10 rounded-md text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// Lesson Editor
function LessonEditor() {
  const { selectedLesson, updateLesson, currentCourse, saveCourse } = useCourseStore();
  const [lessonType, setLessonType] = React.useState<Lesson['type']>('text');
  const [textContent, setTextContent] = React.useState('');
  const [externalVideoUrl, setExternalVideoUrl] = React.useState('');
  const [uploadedFile, setUploadedFile] = React.useState<Attachment | null>(null);
  const [uploadedImages, setUploadedImages] = React.useState<Attachment[]>([]);
  const [uploadedVideo, setUploadedVideo] = React.useState<Attachment | null>(null);

  const queueSave = React.useCallback(() => {
    window.setTimeout(() => {
      saveCourse();
    }, 300);
  }, [saveCourse]);

  React.useEffect(() => {
    if (!selectedLesson) return;

    setLessonType(selectedLesson.type);
    setTextContent(selectedLesson.type === 'text' && typeof selectedLesson.content?.data === 'string' ? selectedLesson.content.data : '');
    setUploadedFile(['pdf', 'download'].includes(selectedLesson.type) ? selectedLesson.attachments[0] || null : null);
    setUploadedImages(selectedLesson.type === 'image' ? selectedLesson.attachments || [] : []);

    const currentVideoUrl = selectedLesson.videoUrl || '';
    const uploadedVideoAttachment = selectedLesson.attachments.find((attachment) => attachment.type?.includes('video')) || null;
    setUploadedVideo(uploadedVideoAttachment);
    setExternalVideoUrl(uploadedVideoAttachment ? '' : currentVideoUrl);
  }, [selectedLesson]);

  const persistLesson = React.useCallback((updates: Partial<Lesson>) => {
    if (!selectedLesson) return;
    updateLesson(selectedLesson.id, updates);
    queueSave();
  }, [selectedLesson, updateLesson, queueSave]);

  const handleTypeChange = (newType: Lesson['type']) => {
    if (!selectedLesson) return;

    setLessonType(newType);

    const reset: Partial<Lesson> = {
      type: newType,
      attachments: newType === 'image' ? uploadedImages : newType === 'video' ? (uploadedVideo ? [uploadedVideo] : []) : newType === 'pdf' || newType === 'download' ? (uploadedFile ? [uploadedFile] : []) : [],
      videoUrl: newType === 'video' ? (uploadedVideo?.url || externalVideoUrl || '') : undefined,
      content: newType === 'image'
        ? { type: 'gallery', data: '' }
        : newType === 'video'
          ? { type: 'video', data: '' }
          : newType === 'pdf' || newType === 'download'
            ? { type: 'file', data: '' }
            : { type: 'rich-text', data: newType === 'text' ? textContent : '' },
    };

    if (newType !== 'video') {
      setExternalVideoUrl('');
      setUploadedVideo(null);
      reset.videoUrl = undefined;
    }
    if (newType !== 'image') setUploadedImages([]);
    if (newType !== 'pdf' && newType !== 'download') setUploadedFile(null);
    if (newType !== 'text') setTextContent('');

    persistLesson(reset);
  };

  const toAttachments = (files: UploadResult[]) => files.map((file) => createAttachmentFromUpload(file));

  if (!selectedLesson) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a lesson to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Lesson Title</label>
        <Input value={selectedLesson.title} onChange={(e) => persistLesson({ title: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea value={selectedLesson.description || ''} onChange={(e) => persistLesson({ description: e.target.value })} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Type</label>
          <select className="w-full h-9 rounded-md border border-input bg-transparent px-3" value={lessonType} onChange={(e) => handleTypeChange(e.target.value as Lesson['type'])}>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="download">Document</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Duration (min)</label>
          <Input type="number" value={Math.round((selectedLesson.duration || 0) / 60)} onChange={(e) => persistLesson({ duration: (parseInt(e.target.value || '0', 10) || 0) * 60 })} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPreview" checked={selectedLesson.isPreview} onChange={(e) => persistLesson({ isPreview: e.target.checked })} />
        <label htmlFor="isPreview" className="text-sm">Allow Preview</label>
      </div>

      {lessonType === 'text' && (
        <Card className="p-4">
          <label className="text-sm font-medium mb-2 block">Content</label>
          <Textarea
            placeholder="Write lesson content here..."
            rows={10}
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              persistLesson({ content: { type: 'rich-text', data: e.target.value } });
            }}
          />
        </Card>
      )}

      {(lessonType === 'pdf' || lessonType === 'download') && (
        <Card className="p-4 space-y-4">
          <label className="text-sm font-medium block">{lessonType === 'pdf' ? 'PDF Document' : 'Document Download'}</label>
          {uploadedFile ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open file</a>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setUploadedFile(null);
                  persistLesson({ attachments: [], content: { type: 'file', data: '' } });
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <FileUpload
              accept={lessonType === 'pdf' ? 'pdf' : 'document'}
              courseId={currentCourse?.id}
              lessonId={selectedLesson.id}
              onUploadComplete={(files) => {
                const attachment = toAttachments(files)[0];
                if (!attachment) return;
                setUploadedFile(attachment);
                persistLesson({ attachments: [attachment], content: { type: 'file', data: '' } });
              }}
              onUploadError={(error) => console.error('Upload error:', error)}
            />
          )}
        </Card>
      )}

      {lessonType === 'image' && (
        <Card className="p-4 space-y-4">
          <label className="text-sm font-medium block">Image Gallery</label>
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((img, index) => (
                <div key={img.id || index} className="relative group">
                  <img src={img.url} alt={img.name} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      const nextImages = uploadedImages.filter((_, i) => i !== index);
                      setUploadedImages(nextImages);
                      persistLesson({ attachments: nextImages, content: { type: 'gallery', data: '' } });
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <FileUpload
            accept="image"
            multiple
            courseId={currentCourse?.id}
            lessonId={selectedLesson.id}
            onUploadComplete={(files) => {
              const nextImages = [...uploadedImages, ...toAttachments(files)];
              setUploadedImages(nextImages);
              persistLesson({ attachments: nextImages, content: { type: 'gallery', data: '' } });
            }}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
        </Card>
      )}

      {lessonType === 'video' && (
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <label className="text-sm font-medium block">Video Source</label>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">External URL (YouTube, Vimeo, etc.)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={externalVideoUrl}
                  onChange={(e) => {
                    setExternalVideoUrl(e.target.value);
                    if (e.target.value) setUploadedVideo(null);
                    persistLesson({ videoUrl: e.target.value, attachments: e.target.value ? [] : selectedLesson.attachments, content: { type: 'video', data: '' } });
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or upload</span></div>
            </div>

            {uploadedVideo ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-8 w-8 text-purple-500" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadedVideo.name}</p>
                    <a href={uploadedVideo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open video</a>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setUploadedVideo(null);
                    persistLesson({ videoUrl: '', attachments: [], content: { type: 'video', data: '' } });
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <FileUpload
                accept="video"
                courseId={currentCourse?.id}
                lessonId={selectedLesson.id}
                onUploadComplete={(files) => {
                  const attachment = toAttachments(files)[0];
                  if (!attachment) return;
                  setUploadedVideo(attachment);
                  setExternalVideoUrl('');
                  persistLesson({ videoUrl: attachment.url, attachments: [attachment], content: { type: 'video', data: '' } });
                }}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            )}
          </Card>

          {(uploadedVideo?.url || externalVideoUrl) && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black border">
              {externalVideoUrl && (externalVideoUrl.includes('youtube.com') || externalVideoUrl.includes('youtu.be')) ? (
                <iframe className="w-full h-full" src={externalVideoUrl.includes('watch?v=') ? externalVideoUrl.replace('watch?v=', 'embed/') : externalVideoUrl.replace('youtu.be/', 'youtube.com/embed/')} title="Lesson Preview" frameBorder="0" allowFullScreen />
              ) : externalVideoUrl && externalVideoUrl.includes('vimeo.com') ? (
                <iframe className="w-full h-full" src={externalVideoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')} title="Lesson Preview" frameBorder="0" allowFullScreen />
              ) : (
                <video className="w-full h-full" controls src={uploadedVideo?.url || externalVideoUrl} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Course Editor
export function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useUIStore();
  const {
    currentCourse,
    selectedSection,
    activeTab,
    previewMode,
    hasUnsavedChanges,
    isSaving,
    setCurrentCourse,
    addSection,
    reorderSections,
    toggleSection,
    setActiveTab,
    setPreviewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    saveCourse,
  } = useCourseStore();

  const { course, isLoading } = useCourse(courseId);

  useEffect(() => {
    if (course) {
      setCurrentCourse(course);
      setBreadcrumbs([
        { label: 'Courses', href: '/admin/courses' },
        { label: course.title, href: `/admin/courses/${course.id}/edit` },
        { label: 'Edit' },
      ]);
    }
  }, [course, setCurrentCourse, setBreadcrumbs]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && currentCourse) {
      const oldIndex = currentCourse.sections.findIndex((s) => s.id === active.id);
      const newIndex = currentCourse.sections.findIndex((s) => s.id === over?.id);
      const newOrder = arrayMove(currentCourse.sections, oldIndex, newIndex).map((s) => s.id);
      reorderSections(newOrder);
    }
  };

  if (isLoading || !currentCourse) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/courses')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{currentCourse.title}</h1>
            {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo()}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo()}>
            <Redo className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={() => window.open(`/courses/${courseId}/preview`, '_blank')}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button loading={isSaving} onClick={() => saveCourse()}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-[#f9fafb]">
        {/* LearnWorlds Sidebar */}
        <aside className="w-64 border-r bg-white flex flex-col pt-4">
          <nav className="flex-1 px-4 space-y-1">
            <Button
              variant={activeTab === 'content' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-3', activeTab === 'content' && 'bg-primary/5 text-primary hover:bg-primary/10')}
              onClick={() => setActiveTab('content')}
            >
              <BookOpen className="h-4 w-4" />
              Course Outline
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-3', activeTab === 'settings' && 'bg-primary/5 text-primary hover:bg-primary/10')}
              onClick={() => setActiveTab('settings')}
            >
              <Monitor className="h-4 w-4" />
              Layout / Page
            </Button>
            <Button
              variant={activeTab === 'seo' ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-3', activeTab === 'seo' && 'bg-primary/5 text-primary hover:bg-primary/10')}
              onClick={() => setActiveTab('seo')}
            >
              <HelpCircle className="h-4 w-4" />
              Settings & SEO
            </Button>
          </nav>

          <div className="p-4 border-t">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 italic text-xs text-indigo-700">
              "Craft compelling contents for your students."
            </div>
          </div>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 overflow-auto p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Course Outline</h2>
                <p className="text-muted-foreground">Manage your sections and learning activities.</p>
              </div>
              <Button onClick={() => addSection({ title: 'New Section', lessons: [] })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>

            {currentCourse.sections.length === 0 ? (
              <Card className="border-dashed h-64 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Start building your course</h3>
                  <p className="text-sm text-muted-foreground">Add your first section to begin crafting your content.</p>
                </div>
                <Button onClick={() => addSection({ title: 'New Section', lessons: [] })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Section
                </Button>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={currentCourse.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {currentCourse.sections.map((section, index) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        index={index}
                        isExpanded={section.isExpanded || false}
                        onToggle={() => toggleSection(section.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>
      </div>

      {/* Right Side Drawer for Section Editing */}
      <Sheet open={!!selectedSection} onOpenChange={(open) => !open && useCourseStore.getState().selectSection(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Section</SheetTitle>
            <SheetDescription>
              Configure section details, appearance, and access status.
            </SheetDescription>
          </SheetHeader>

          {selectedSection && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Title</label>
                <Input
                  value={selectedSection.title}
                  onChange={(e) => useCourseStore.getState().updateSection(selectedSection.id, { title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Access Status</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3"
                  value={selectedSection.accessStatus || 'draft'}
                  onChange={(e) => useCourseStore.getState().updateSection(selectedSection.id, { accessStatus: e.target.value as any })}
                >
                  <option value="draft">Draft (Visible only to you)</option>
                  <option value="soon">Coming Soon (Visible but locked)</option>
                  <option value="free">Free (Previewable)</option>
                  <option value="paid">Paid (Enrolled users only)</option>
                </select>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-4">Lessons in this section</h4>
                <div className="space-y-2">
                   <LessonList sectionId={selectedSection.id} lessons={selectedSection.lessons} />
                </div>
              </div>

              <div className="pt-6">
                <LessonEditor />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
