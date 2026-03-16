import { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { uploadService } from '@/services/uploadService';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (url: string, metadata?: any) => void;
  onError?: (error: string) => void;
  type?: 'image' | 'video' | 'document';
  preview?: boolean;
  className?: string;
}

export function FileUploader({
  accept = '*',
  maxSize = 50,
  onUpload,
  onError,
  type = 'document',
  preview = true,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (type === 'image' && preview) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    setIsUploading(true);
    setProgress(0);

    try {
      let result;
      switch (type) {
        case 'image':
          result = await uploadService.uploadImage(file);
          break;
        case 'video':
          result = await uploadService.uploadVideo(file, setProgress);
          break;
        case 'document':
          result = await uploadService.uploadDocument(file);
          break;
        default:
          result = await uploadService.uploadDocument(file);
      }

      onUpload(result.url, result);
    } catch (error: any) {
      onError?.(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-red-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  if (previewUrl && type === 'image') {
    return (
      <div className="relative inline-block">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-48 h-48 object-cover rounded-lg"
        />
        <button
          onClick={clearPreview}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {getIcon()}
        <div>
          <p className="text-sm font-medium text-gray-700">
            {isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max file size: {maxSize}MB
          </p>
        </div>

        {isUploading ? (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}%</p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Select File
          </Button>
        )}
      </div>
    </div>
  );
}
