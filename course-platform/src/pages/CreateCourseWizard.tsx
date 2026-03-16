import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Input, 
  Label, 
  Textarea,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Globe, 
  Lock, 
  Clock, 
  Layout, 
  CreditCard,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react';
import { cn, slugify } from '@/utils';
import { useCourses } from '@/hooks';
import { showErrorToast } from '@/stores';

const steps = [
  { id: 1, title: 'Basic Info', icon: BookOpen },
  { id: 2, title: 'URL & SEO', icon: LinkIcon },
  { id: 3, title: 'Access', icon: Lock },
  { id: 4, title: 'Template', icon: Layout },
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
    price: 0,
  });

  const [slugModified, setSlugModified] = useState(false);
  const [isSlugValidating, setIsSlugValidating] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugModified && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugModified]);

  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 1 && !formData.title) {
        showErrorToast('Validation Error', 'Course title is required');
        return;
      }
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
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

      const result: any = await createCourse({
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        slug: formData.slug,
        access: formData.access,
        coursePageTemplate: formData.coursePageTemplate,
        category: formData.category,
        price: formData.price,
        afterPurchase: {
          type: 'afterlogin',
          navigationType: 'global',
          settings: { url: '', page: '' }
        }
      });

      // Redirection logic (useCourses hook handles success toast)
      // Note: We need the ID from the result
      if (result?.id) {
        navigate(`/courses/${result.id}/edit`);
      } else {
        // Fallback to list if ID missing for some reason
        navigate('/courses');
      }
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
              <Label htmlFor="title" className="text-lg font-semibold">What is the title of your course?</Label>
              <Input 
                id="title"
                placeholder="e.g. Master React in 30 Days"
                className="text-lg h-12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">This can be changed later.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">Course Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe what students will learn..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-lg font-semibold">Keywords</Label>
              <Input 
                id="keywords"
                placeholder="mastery, react, frontend, development"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Add relevant keywords for searchability.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-lg font-semibold">Course URL</Label>
              <div className="flex items-center gap-2 group">
                <div className="h-12 px-4 flex items-center bg-muted border border-r-0 rounded-l-md text-muted-foreground">
                  /course/
                </div>
                <Input 
                  id="slug"
                  className="text-lg h-12 rounded-l-none"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                    setSlugModified(true);
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">This is the permanent URL for your course. Only lowercase, numbers and hyphens allowed.</p>
              {slugError && <p className="text-sm text-destructive font-medium">{slugError}</p>}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Preview</p>
              <p className="text-primary font-bold">your-school-url.com/course/{formData.slug || '...'}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Label className="text-lg font-semibold">Who can access this course?</Label>
            <RadioGroup 
              value={formData.access} 
              onValueChange={(val: string) => setFormData({ ...formData, access: val })}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { id: 'draft', title: 'Draft', desc: 'Visible only to you and admins', icon: Lock },
                { id: 'free', title: 'Free', desc: 'Anyone can enroll for free', icon: Globe },
                { id: 'paid', title: 'Paid', desc: 'Students must pay to access', icon: CreditCard },
                { id: 'private', title: 'Private', desc: 'Invite only enrollment', icon: Lock },
                { id: 'coming_soon', title: 'Coming Soon', desc: 'Visible but not enrollable', icon: Clock },
              ].map((opt) => (
                <div key={opt.id} className="relative">
                  <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                  <Label
                    htmlFor={opt.id}
                    className="flex flex-col items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <opt.icon className="h-4 w-4 text-primary" />
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
            <Label className="text-lg font-semibold">Select a Page Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'default', title: 'Default', desc: 'Standard course landing page', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80' },
                { id: 'sales', title: 'Sales Funnel', desc: 'Optimized for conversions', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
                { id: 'minimal', title: 'Minimal', desc: 'Just the essentials', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80' },
              ].map((tpl) => (
                <div key={tpl.id} className="group relative">
                  <div 
                    onClick={() => setFormData({ ...formData, coursePageTemplate: tpl.id })}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl overflow-hidden transition-all",
                      formData.coursePageTemplate === tpl.id ? "border-primary scale-105 shadow-lg" : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <img src={tpl.img} alt={tpl.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="font-bold">{tpl.title}</p>
                      <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                    </div>
                  </div>
                  {formData.coursePageTemplate === tpl.id && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[80vh] flex flex-col">
      {/* Step Indicator */}
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
                  currentStep >= step.id ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-background border-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest",
                currentStep >= step.id ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Header */}
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Create your course</h1>
        <p className="text-muted-foreground text-lg">Step {currentStep} of {steps.length}: {steps[currentStep-1].title}</p>
      </div>

      {/* Main Form Area */}
      <Card className="flex-1 p-8 md:p-12 shadow-xl border-none bg-background/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        {renderStep()}
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 1 || isCreating}
          className="h-12 px-8 font-bold border-2"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/courses')}
            className="h-12 font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={isCreating}
            className="h-12 px-10 font-bold shadow-lg shadow-primary/20"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : currentStep === 4 ? (
              <span className="flex items-center gap-2">
                Finish & Create
                <Check className="ml-2 h-5 w-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
