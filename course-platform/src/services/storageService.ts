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
  pdf: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
} as const;

const ALLOWED_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
};

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<UploadResult> {
    const { courseId, lessonId } = options;

    // Determine file type category
    const fileType = this.getFileTypeCategory(file.type);
    
    // Validate file type
    if (!this.isValidFileType(file.type, fileType)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES[fileType].join(', ')}`);
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[fileType];
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size for ${fileType} is ${this.formatFileSize(maxSize)}`);
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = this.sanitizeFileName(file.name);
    let path: string;
    
    if (courseId) {
      path = lessonId
        ? `courses/${courseId}/lessons/${lessonId}/files/${timestamp}-${sanitizedName}`
        : `courses/${courseId}/files/${timestamp}-${sanitizedName}`;
    } else {
      // Temp path for wizard uploads (before course is created)
      const tempId = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
      path = `temp/wizard/${tempId}/${timestamp}-${sanitizedName}`;
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-content')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: FileUploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    }
    
    return results;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('course-content')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  /**
   * Get file type category
   */
  getFileTypeCategory(mimeType: string): 'pdf' | 'image' | 'video' {
    if (ALLOWED_TYPES.pdf.includes(mimeType)) return 'pdf';
    if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
    if (ALLOWED_TYPES.video.includes(mimeType)) return 'video';
    
    // Default to image for unknown types that start with image/
    if (mimeType.startsWith('image/')) return 'image';
    
    throw new Error(`Unsupported file type: ${mimeType}`);
  },

  /**
   * Check if file type is valid
   */
  isValidFileType(mimeType: string, category: string): boolean {
    const types = ALLOWED_TYPES[category];
    if (!types) return false;
    return types.includes(mimeType) || 
           (category === 'image' && mimeType.startsWith('image/'));
  },

  /**
   * Sanitize file name
   */
  sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file icon based on type
   */
  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    return '📎';
  },
};
