import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, FileVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<string>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  description?: string;
  className?: string;
  previewType?: 'image' | 'video' | 'file';
  value?: string;
  onChange?: (url: string | null) => void;
}

export function FileUploader({
  onUpload,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  label = "Click to upload or drag and drop",
  description,
  className,
  previewType = 'file',
  value,
  onChange,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);
      const url = await onUpload(acceptedFiles[0]);
      onChange?.(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const renderPreview = () => {
    if (!value) return null;

    if (previewType === 'image') {
      return (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
        <div className="p-2 rounded-md bg-white border">
          {previewType === 'video' ? (
            <FileVideo className="h-5 w-5 text-blue-500" />
          ) : (
            <File className="h-5 w-5 text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <p className="text-sm font-medium truncate">{value.split('/').pop()}</p>
          <p className="text-xs text-slate-500">Asset uploaded successfully</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-destructive"
          onClick={clearFile}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (value) return <div className={cn("space-y-3", className)}>{renderPreview()}</div>;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
          isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300 bg-slate-50/50",
          error && "border-destructive bg-destructive/5",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
          ) : (
            <div className="p-3 rounded-full bg-white shadow-sm border mb-2">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="text-xs text-slate-500">
              {description || `Maximum size: ${Math.floor(maxSize / (1024 * 1024))}MB`}
            </p>
          </div>
          
          {error && (
            <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
