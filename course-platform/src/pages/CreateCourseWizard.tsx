import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Input, 
  Label, 
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Globe, 
  Lock, 
  Clock, 
  Layout, 
  Users,
  Link as LinkIcon,
  BookOpen,
  Loader2,
  Upload
} from 'lucide-react';
import { cn, slugify } from '@/utils';
import { useCourses } from '@/hooks';
import { showErrorToast } from '@/stores';
import { supabase } from '@/lib/supabase';
import { FileUpload } from '@/components/common/FileUpload';
import { courseService } from '@/services/courseService';

const steps = [
  { id: 1, title: 'Basic Info', icon: BookOpen },
  { id: 2, title: 'URL & SEO', icon: LinkIcon },
  { id: 3, title: 'Access', icon: Lock },
  { id: 4, title: 'Template', icon: Layout },
  { id: 5, title: 'Add Content', icon: Upload },
];

export function CreateCourseWizard() {
  const navigate = useNavigate();
  const { createCourse, isCreating } = useCourses();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    slug: '',
    access: 'draft',
    coursePageTemplate: 'default',
    category: 'General',
  });

  const [slugModified, setSlugModified] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugValid, setSlugValid] = useState(false);
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<{
    pdfs: { url: string; name: string; type: string }[];
    images: { url: string; name: string; type: string }[];
    video: { url: string; name: string; type: string } | null;
  }>({
    pdfs: [],
    images: [],
    video: null,
  });
  const [externalVideoUrl, setExternalVideoUrl] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugModified && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugModified]);

  // Check slug uniqueness
  const checkSlugUniqueness = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugError('Slug must be at least 2 characters');
      setSlugValid(false);
      return;
    }
    
    setIsCheckingSlug(true);
    setSlugError(null);
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSlugError('This URL is already taken. Please choose another.');
        setSlugValid(false);
      } else {
        setSlugError(null);
        setSlugValid(true);
      }
    } catch (err) {
      setSlugError('Error checking URL availability');
      setSlugValid(false);
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Debounced slug check
  useEffect(() => {
    if (formData.slug && slugModified) {
      const timer = setTimeout(() => {
        checkSlugUniqueness(formData.slug);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.slug, slugModified, checkSlugUniqueness]);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      if (currentStep === 1 && !formData.title) {
        showErrorToast('Validation Error', 'Course title is required');
        return;
      }
      if (currentStep === 2) {
        if (!formData.slug) {
          showErrorToast('Validation Error', 'Course URL is required');
          return;
        }
        if (slugError || !slugValid) {
          showErrorToast('Validation Error', 'Please fix the URL before continuing');
          return;
        }
      }
      setCurrentStep(prev => prev + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Final validation
      if (!formData.title) throw new Error('Title is required');
      if (!formData.slug) throw new Error('Slug is required');

      // 1. Create course
      const course = await createCourse({
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        slug: formData.slug,
        access: formData.access,
        coursePageTemplate: formData.coursePageTemplate,
        category: formData.category,
        afterPurchase: {
          type: 'afterlogin',
          navigationType: 'global',
          settings: { url: '', page: '' }
        }
      });

      if (!course?.id) {
        throw new Error('Failed to create course');
      }

      // 2. Create section "Module 1"
      const section = await courseService.createSection(course.id, {
        title: 'Module 1',
        order: 1
      });

      // 3. Create lessons from uploaded files
      const lessons = [];

      // PDF lessons
      for (const pdf of uploadedFiles.pdfs || []) {
        lessons.push(await courseService.createLesson(course.id, section.id, {
          title: pdf.name,
          type: 'download',
          content: { type: 'rich-text', data: `Download: ${pdf.url}` },
          order: lessons.length + 1
        }));
      }

      // Image lessons
      for (const img of uploadedFiles.images || []) {
        lessons.push(await courseService.createLesson(course.id, section.id, {
          title: img.name,
          type: 'download',
          content: { type: 'rich-text', data: `Image: ${img.url}` },
          order: lessons.length + 1
        }));
      }

      // Video lesson
      const video = uploadedFiles.video;
      if (video || externalVideoUrl) {
        lessons.push(await courseService.createLesson(course.id, section.id, {
          title: 'Introduction Video',
          type: 'video',
          videoUrl: video?.url || externalVideoUrl,
          content: { type: 'video', data: 'Video lesson' },
          order: lessons.length + 1
        }));
      }

      // 4. Redirect to course editor
      navigate(`/courses/${course.id}/edit`);
    } catch (error: any) {
      showErrorToast('Creation failed', error.message || 'Could not create course');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold">Course Title *</Label>
              <Input 
                id="title"
                placeholder="e.g., Advanced React Patterns"
                className="text-lg h-12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Choose a clear, descriptive title for your course.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
              <Textarea 
                id="description"
                placeholder="What will students learn in this course?"
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Optional: Provide a brief overview of your course content.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-lg font-semibold">Course URL *</Label>
              <div className="flex items-center gap-2">
                <div className="h-12 px-4 flex items-center bg-muted border border-r-0 rounded-l-md text-muted-foreground whitespace-nowrap">
                  /course/
                </div>
                <Input 
                  id="slug"
                  className={cn(
                    "text-lg h-12 rounded-l-none",
                    slugValid && "border-green-500 focus-visible:ring-green-500",
                    slugError && "border-red-500 focus-visible:ring-red-500"
                  )}
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                    setSlugModified(true);
                    setSlugValid(false);
                  }}
                />
                {isCheckingSlug && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
                {!isCheckingSlug && slugValid && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
              {slugError ? (
                <p className="text-sm text-red-500">{slugError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">This will be the permanent URL for your course. Use only lowercase letters, numbers, and hyphens.</p>
              )}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm font-medium text-muted-foreground mb-1">URL Preview</p>
              <p className="text-primary font-medium">
                {window.location.origin}/course/{formData.slug || 'your-course-slug'}
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label className="text-lg font-semibold">Access Level</Label>
            <RadioGroup 
              value={formData.access} 
              onValueChange={(val: string) => setFormData({ ...formData, access: val })}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { id: 'public', title: 'Public', desc: 'All employees can access', icon: Globe },
                { id: 'department', title: 'Department', desc: 'Specific departments only', icon: Users },
                { id: 'restricted', title: 'Restricted', desc: 'Selected groups only', icon: Lock },
                { id: 'draft', title: 'Draft', desc: 'Visible only to you and admins', icon: Clock },
              ].map((opt) => (
                <div key={opt.id} className="relative">
                  <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                  <Label
                    htmlFor={opt.id}
                    className="flex flex-col p-4 border-2 rounded-xl cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all h-full"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <opt.icon className="h-5 w-5 text-primary" />
                      <span className="font-bold">{opt.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{opt.desc}</span>
                  </Label>
                  {formData.access === opt.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label className="text-lg font-semibold">Choose a Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'default', title: 'Default', desc: 'Standard course page layout' },
                { id: 'minimal', title: 'Minimal', desc: 'Clean and simple design' },
                { id: 'sales', title: 'Sales', desc: 'Optimized for conversions' },
              ].map((tpl) => (
                <div key={tpl.id} className="relative">
                  <div 
                    onClick={() => setFormData({ ...formData, coursePageTemplate: tpl.id })}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-6 transition-all h-full",
                      formData.coursePageTemplate === tpl.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <Layout className="h-8 w-8 text-primary mb-4" />
                    <p className="font-bold mb-1">{tpl.title}</p>
                    <p className="text-sm text-muted-foreground">{tpl.desc}</p>
                  </div>
                  {formData.coursePageTemplate === tpl.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Course Content</h3>
              <p className="text-muted-foreground">Upload materials for your first module.</p>
            </div>
            
            <Tabs defaultValue="pdf">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pdf">PDFs</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pdf">
                <FileUpload
                  accept="pdf"
                  multiple
                  onUploadComplete={(files) => setUploadedFiles(prev => ({...prev, pdfs: files}))}
                />
              </TabsContent>
              
              <TabsContent value="images">
                <FileUpload
                  accept="image"
                  multiple
                  onUploadComplete={(files) => setUploadedFiles(prev => ({...prev, images: files}))}
                />
              </TabsContent>
              
              <TabsContent value="video">
                <FileUpload
                  accept="video"
                  onUploadComplete={(files) => setUploadedFiles(prev => ({...prev, video: files[0]}))}
                />
                <div className="mt-4">
                  <Label>Or enter external video URL</Label>
                  <Input 
                    placeholder="https://youtube.com/..."
                    value={externalVideoUrl}
                    onChange={(e) => setExternalVideoUrl(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[80vh] flex flex-col">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 -z-10" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep > step.id 
                    ? "bg-green-500 border-green-500 text-white" 
                    : currentStep === step.id 
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                      : "bg-background border-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-xs font-medium",
                currentStep >= step.id ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Step {currentStep} of {steps.length}: {steps[currentStep-1].title}</p>
      </div>

      {/* Form Card */}
      <Card className="flex-1 p-8 shadow-sm">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 1 || isCreating}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/courses')}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={isCreating || (currentStep === 2 && !slugValid)}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : currentStep === steps.length ? (
              <>
                Create Course
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
