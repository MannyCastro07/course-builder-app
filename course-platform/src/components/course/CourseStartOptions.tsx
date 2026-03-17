import { BookOpen, Sparkles, Upload, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CourseStartOptionsProps = {
  onStartFromScratch: () => void;
  onStartWithAI?: () => void;
  onUploadFiles?: () => void;
  onImportSync?: () => void;
};

export function CourseStartOptions({
  onStartFromScratch,
  onStartWithAI,
  onUploadFiles,
  onImportSync,
}: CourseStartOptionsProps) {
  const options = [
    {
      title: "Start building from scratch",
      description:
        "Access the richest library of learning activities and the most customizable course player on the market.",
      icon: <BookOpen className="h-5 w-5 text-amber-600" />,
      onClick: onStartFromScratch,
    },
    {
      title: "Start building with AI",
      description:
        "Powered by advanced generative AI technology, the AI Assistant creates high-quality, engaging content.",
      icon: <Sparkles className="h-5 w-5 text-violet-600" />,
      onClick: onStartWithAI,
    },
    {
      title: "Upload your files",
      description:
        "Upload your files in bulk and watch them transform into engaging learning activities in minutes.",
      icon: <Upload className="h-5 w-5 text-blue-600" />,
      onClick: onUploadFiles,
    },
    {
      title: "Import & sync",
      description:
        "Effortlessly transfer and sync course content across courses within or between schools.",
      icon: <RefreshCcw className="h-5 w-5 text-emerald-600" />,
      onClick: onImportSync,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Craft the contents for your online course
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to start building your course.
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <Card
            key={option.title}
            className="cursor-pointer rounded-2xl border bg-white p-5 transition hover:shadow-md hover:border-primary/30"
            onClick={option.onClick}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-xl bg-muted p-3">
                {option.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-base">{option.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-6">
                  {option.description}
                </p>
              </div>

              <Button variant="ghost" className="shrink-0">
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
