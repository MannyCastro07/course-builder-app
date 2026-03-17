import { supabase } from '@/lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadOptions {
  courseId?: string;
  lessonId?: string;
  onProgress?: (progress: UploadProgress) => void;
}

const MAX_FILE_SIZES = {
  pdf: 50 * 1024 * 1024,
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  document: 25 * 1024 * 1024,
} as const;

const ALLOWED_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
  ],
};

const EXTENSION_TO_CATEGORY: Record<string, 'pdf' | 'image' | 'video' | 'document'> = {
  pdf: 'pdf',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  mp4: 'video',
  webm: 'video',
  ogg: 'video',
  mov: 'video',
  doc: 'document',
  docx: 'document',
  txt: 'document',
  rtf: 'document',
  odt: 'document',
};

const LOCAL_UPLOAD_PORT = 4310;
const LOCAL_UPLOAD_PREFIX = 'local://';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getLocalUploadBaseUrl() {
  if (!isBrowser()) return `http://127.0.0.1:${LOCAL_UPLOAD_PORT}`;
  const configured = import.meta.env.VITE_LOCAL_UPLOAD_BASE_URL;
  if (configured) return configured;
  return `${window.location.protocol}//${window.location.hostname}:${LOCAL_UPLOAD_PORT}`;
}

function isLocalUploadPath(path: string) {
  return path.startsWith(LOCAL_UPLOAD_PREFIX);
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  async uploadFile(file: File, options: FileUploadOptions): Promise<UploadResult> {
    const { courseId, lessonId } = options;
    const fileType = this.getFileTypeCategory(file);

    if (!this.isValidFileType(file, fileType)) {
      throw new Error(`Invalid file type: ${file.type || file.name}.`);
    }

    const maxSize = MAX_FILE_SIZES[fileType];
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size for ${fileType} is ${this.formatFileSize(maxSize)}`);
    }

    const timestamp = Date.now();
    const sanitizedName = this.sanitizeFileName(file.name);
    const tempId = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}-${Math.random().toString(36).substring(2, 15)}`;

    const path = courseId
      ? lessonId
        ? `courses/${courseId}/lessons/${lessonId}/files/${timestamp}-${sanitizedName}`
        : `courses/${courseId}/files/${timestamp}-${sanitizedName}`
      : `temp/wizard/${tempId}/${timestamp}-${sanitizedName}`;

    try {
      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      return this.buildUploadResult(data.path, file.name, file.type, file.size);
    } catch (error) {
      if (!isBrowser()) throw error;
      return this.uploadFileLocally(file, path, options);
    }
  },

  async uploadFileLocally(file: File, desiredPath: string, options: FileUploadOptions): Promise<UploadResult> {
    const baseUrl = getLocalUploadBaseUrl();
    const base64 = await toBase64(file);
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-base-url': baseUrl,
      },
      body: JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        desiredPath,
        data: base64,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Local upload fallback failed: ${text || response.statusText}`);
    }

    const data = await response.json();
    options.onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });
    return {
      url: data.url,
      path: `${LOCAL_UPLOAD_PREFIX}${data.path}`,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  async uploadMultipleFiles(files: File[], options: FileUploadOptions): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const file of files) {
      results.push(await this.uploadFile(file, options));
    }
    return results;
  },

  async finalizeUploads(files: UploadResult[], courseId: string, lessonId?: string): Promise<UploadResult[]> {
    const finalized: UploadResult[] = [];

    for (const file of files) {
      if (!file?.path) continue;
      if (isLocalUploadPath(file.path) || file.path.startsWith(`courses/${courseId}/`)) {
        finalized.push(file);
        continue;
      }

      const timestamp = Date.now();
      const sanitizedName = this.sanitizeFileName(file.name);
      const destination = lessonId
        ? `courses/${courseId}/lessons/${lessonId}/files/${timestamp}-${sanitizedName}`
        : `courses/${courseId}/files/${timestamp}-${sanitizedName}`;

      const { error } = await supabase.storage.from('course-content').copy(file.path, destination);
      if (error) throw new Error(`Could not finalize upload for ${file.name}: ${error.message}`);

      finalized.push(this.buildUploadResult(destination, file.name, file.type, file.size));
      await this.deleteFile(file.path).catch(() => undefined);
    }

    return finalized;
  },

  async deleteFile(path: string): Promise<void> {
    if (isLocalUploadPath(path)) {
      const baseUrl = getLocalUploadBaseUrl();
      const localPath = path.replace(LOCAL_UPLOAD_PREFIX, '');
      const response = await fetch(`${baseUrl}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: localPath }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Delete failed: ${text || response.statusText}`);
      }
      return;
    }

    const { error } = await supabase.storage.from('course-content').remove([path]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  },

  getFileTypeCategory(fileOrMimeType: File | string): 'pdf' | 'image' | 'video' | 'document' {
    const mimeType = typeof fileOrMimeType === 'string' ? fileOrMimeType : fileOrMimeType.type;
    const fileName = typeof fileOrMimeType === 'string' ? '' : fileOrMimeType.name;
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (ALLOWED_TYPES.pdf.includes(mimeType) || extension === 'pdf') return 'pdf';
    if (ALLOWED_TYPES.image.includes(mimeType) || mimeType.startsWith('image/') || EXTENSION_TO_CATEGORY[extension] === 'image') return 'image';
    if (ALLOWED_TYPES.video.includes(mimeType) || EXTENSION_TO_CATEGORY[extension] === 'video') return 'video';
    if (ALLOWED_TYPES.document.includes(mimeType) || EXTENSION_TO_CATEGORY[extension] === 'document') return 'document';

    throw new Error(`Unsupported file type: ${mimeType || fileName}`);
  },

  isValidFileType(fileOrMimeType: File | string, category: string): boolean {
    const mimeType = typeof fileOrMimeType === 'string' ? fileOrMimeType : fileOrMimeType.type;
    const fileName = typeof fileOrMimeType === 'string' ? '' : fileOrMimeType.name;
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const types = ALLOWED_TYPES[category];
    if (!types) return false;
    return types.includes(mimeType)
      || (category === 'image' && mimeType.startsWith('image/'))
      || EXTENSION_TO_CATEGORY[extension] === category;
  },

  sanitizeFileName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-').substring(0, 100);
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('word') || type.includes('document') || type.includes('text')) return '📝';
    return '📎';
  },

  buildUploadResult(path: string, name: string, type: string, size: number): UploadResult {
    const { data: { publicUrl } } = supabase.storage.from('course-content').getPublicUrl(path);
    return { url: publicUrl, path, name, size, type };
  },
};
