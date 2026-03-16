import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn, formatFileSize } from '@/utils';
import { Button, Progress } from '@/components/ui';
import { Upload, X, File, Image, Video, Music, FileText } from 'lucide-react';

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => void;
  onProgress?: (file: string, progress: number) => void;
  uploading?: boolean;
  progress?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  preview?: boolean;
  className?: string;
}

const fileIcons: Record<string, React.ElementType> = {
  'image/': Image,
  'video/': Video,
  'audio/': Music,
  'application/pdf': FileText,
  default: File,
};

function getFileIcon(type: string) {
  for (const [key, Icon] of Object.entries(fileIcons)) {
    if (type.startsWith(key.replace('/', '')) || type === key) {
      return Icon;
    }
  }
  return fileIcons.default;
}

export function FileUploader({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 1,
  multiple = false,
  onUpload,
  onProgress,
  uploading = false,
  progress = 0,
  value = [],
  onChange,
  preview = true,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<File[]>(value);
  const [previews, setPreviews] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      const limitedFiles = newFiles.slice(0, maxFiles);
      
      setFiles(limitedFiles);
      onChange?.(limitedFiles);

      // Generate previews for images
      if (preview) {
        limitedFiles.forEach((file) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setPreviews((prev) => ({
                ...prev,
                [file.name]: reader.result as string,
              }));
            };
            reader.readAsDataURL(file);
          }
        });
      }
    },
    [files, multiple, maxFiles, onChange, preview]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const errors = fileRejections.map(({ file, errors }) => ({
    file: file.name,
    errors: errors.map((e) => e.message),
  }));

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
        </p>
        <p className="text-xs text-muted-foreground">
          o haz clic para seleccionar archivos
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Máximo {formatFileSize(maxSize)} {multiple && `• Hasta ${maxFiles} archivos`}
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map(({ file, errors: fileErrors }, index) => (
            <div key={index} className="text-sm text-destructive">
              <strong>{file}:</strong> {fileErrors.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file.type);
            const filePreview = previews[file.name];

            return (
              <div
                key={file.name}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt={file.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Subiendo...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && !uploading && (
        <div className="mt-4 flex justify-end">
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Subir {files.length > 1 ? 'archivos' : 'archivo'}
          </Button>
        </div>
      )}
    </div>
  );
}
