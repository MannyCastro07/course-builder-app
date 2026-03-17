import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, Image, Video, FileText } from 'lucide-react';
import { storageService, type UploadResult } from '@/services/storageService';
import { cn } from '@/utils';

interface FileUploadProps {
  courseId?: string;
  lessonId?: string;
  accept: 'pdf' | 'image' | 'video' | 'document' | 'all';
  multiple?: boolean;
  onUploadComplete?: (files: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
}

export function FileUpload({
  courseId,
  lessonId,
  accept,
  multiple = false,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = {
    pdf: '.pdf',
    image: 'image/*',
    video: 'video/*',
    document: '.doc,.docx,.txt,.rtf,.odt',
    all: '*/*',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles((prev) => multiple ? [...prev, ...selected] : selected);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const results: UploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await storageService.uploadFile(file, {
          courseId,
          lessonId,
          onProgress: (p) => {
            const overallProgress = ((i + p.percentage / 100) / files.length) * 100;
            setProgress(Math.round(overallProgress));
          },
        });
        results.push(result);
      }

      setUploadedFiles(results);
      setFiles([]);
      onUploadComplete?.(results);
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const removeUploadedFile = (index: number) => setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.includes('video')) return <Video className="h-5 w-5 text-purple-500" />;
    if (type.includes('word') || type.includes('document') || type.includes('text')) return <FileText className="h-5 w-5 text-amber-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const uploadLabel = accept === 'pdf'
    ? 'PDFs'
    : accept === 'image'
      ? 'images'
      : accept === 'video'
        ? 'videos'
        : accept === 'document'
          ? 'documents'
          : 'files';

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          'hover:border-primary hover:bg-primary/5',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Click to upload {uploadLabel}</p>
        <p className="text-xs text-muted-foreground">
          {accept === 'pdf' && 'PDF files up to 50MB'}
          {accept === 'image' && 'JPEG, PNG, GIF, SVG, and WebP up to 10MB'}
          {accept === 'video' && 'MP4, WebM, OGG, and MOV up to 500MB'}
          {accept === 'document' && 'DOC, DOCX, TXT, RTF, and ODT up to 25MB'}
          {accept === 'all' && 'Upload any supported file type'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes[accept]}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && (
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">Uploading... {progress}%</p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} file{files.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">Uploaded successfully:</p>
          {uploadedFiles.map((file, index) => (
            <div key={`${file.path}-${index}`} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  View file
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeUploadedFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
