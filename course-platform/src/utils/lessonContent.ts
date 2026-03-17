import type { Attachment, Lesson, LessonContent } from '@/types';

export interface LessonContentEnvelope {
  schemaVersion: 1;
  description?: string;
  text?: string;
  attachments?: Attachment[];
  videoUrl?: string;
}

export interface NormalizedLessonState {
  description?: string;
  textContent: string;
  attachments: Attachment[];
  videoUrl?: string;
  content: LessonContent;
}

const isObject = (value: unknown): value is Record<string, any> => typeof value === 'object' && value !== null;

const toAttachment = (file: any, fallbackId: string, fallbackName: string, fallbackType = 'application/octet-stream'): Attachment => ({
  id: file?.id || fallbackId,
  name: file?.name || fallbackName,
  url: file?.url || file?.fileUrl || '',
  size: typeof file?.size === 'number' ? file.size : 0,
  type: file?.type || fallbackType,
});

export function createAttachmentFromUpload(file: { path?: string; url: string; name: string; type: string; size?: number }, fallbackId?: string): Attachment {
  return {
    id: fallbackId || file.path || file.url,
    name: file.name,
    url: file.url,
    size: file.size || 0,
    type: file.type,
  };
}

function buildEnvelopeFromLegacy(type: Lesson['type'], rawContent: string, description?: string, videoUrl?: string): LessonContentEnvelope {
  if (!rawContent) {
    return { schemaVersion: 1, description, attachments: [], text: '', videoUrl };
  }

  try {
    const parsed = JSON.parse(rawContent);

    if (parsed?.schemaVersion === 1) {
      return parsed as LessonContentEnvelope;
    }

    if (type === 'pdf' && parsed?.fileUrl) {
      return {
        schemaVersion: 1,
        description,
        attachments: [toAttachment(parsed, `pdf-${parsed.fileUrl}`, parsed.fileName || 'PDF Document', 'application/pdf')],
        videoUrl,
      };
    }

    if (type === 'image' && Array.isArray(parsed?.files)) {
      return {
        schemaVersion: 1,
        description,
        attachments: parsed.files.map((file: any, index: number) =>
          toAttachment(file, `image-${index}-${file.url || 'file'}`, file.name || `Image ${index + 1}`, file.type || 'image/jpeg')
        ),
        videoUrl,
      };
    }

    if (type === 'download') {
      const fileCandidates = Array.isArray(parsed?.attachments)
        ? parsed.attachments
        : parsed?.fileUrl
          ? [parsed]
          : [];

      return {
        schemaVersion: 1,
        description,
        attachments: fileCandidates.map((file: any, index: number) =>
          toAttachment(file, `download-${index}-${file.url || file.fileUrl || 'file'}`, file.name || file.fileName || `Document ${index + 1}`, file.type || 'application/octet-stream')
        ),
        text: typeof parsed?.text === 'string' ? parsed.text : '',
        videoUrl,
      };
    }

    if (type === 'text') {
      return {
        schemaVersion: 1,
        description,
        text: typeof parsed?.data === 'string' ? parsed.data : typeof parsed?.text === 'string' ? parsed.text : rawContent,
        attachments: [],
        videoUrl,
      };
    }
  } catch {
    // Plain text legacy payload.
  }

  return {
    schemaVersion: 1,
    description,
    text: type === 'text' ? rawContent : '',
    attachments: [],
    videoUrl,
  };
}

export function normalizeLessonRecord(data: any): NormalizedLessonState {
  const rawContent = typeof data?.content === 'string' ? data.content : '';
  const type = (data?.type || 'text') as Lesson['type'];
  const legacyDescription = typeof data?.description === 'string' ? data.description : undefined;
  const envelope = buildEnvelopeFromLegacy(type, rawContent, legacyDescription, data?.video_url || data?.videoUrl);
  const attachments = Array.isArray(envelope.attachments) ? envelope.attachments.filter((attachment) => attachment?.url) : [];
  const textContent = envelope.text || '';
  const description = envelope.description || legacyDescription;
  const videoUrl = envelope.videoUrl || data?.video_url || data?.videoUrl;

  const contentType: LessonContent['type'] =
    type === 'video'
      ? 'video'
      : type === 'image'
        ? 'gallery'
        : type === 'pdf' || type === 'download'
          ? 'file'
          : 'rich-text';

  return {
    description,
    textContent,
    attachments,
    videoUrl,
    content: {
      type: contentType,
      data: JSON.stringify({
        schemaVersion: 1,
        description,
        text: textContent,
        attachments,
        videoUrl,
      } satisfies LessonContentEnvelope),
    },
  };
}

export function serializeLessonContent(lesson: Partial<Lesson>): string {
  const normalized = normalizeLessonForSave(lesson);
  return JSON.stringify(normalized);
}

export function normalizeLessonForSave(lesson: Partial<Lesson>): LessonContentEnvelope {
  const attachments = Array.isArray(lesson.attachments) ? lesson.attachments.filter((attachment) => attachment?.url) : [];
  let text = '';

  if (lesson.type === 'text' && typeof lesson.content?.data === 'string') {
    text = lesson.content.data;
  } else if (typeof lesson.content?.data === 'string') {
    try {
      const parsed = JSON.parse(lesson.content.data);
      if (isObject(parsed) && typeof parsed.text === 'string') {
        text = parsed.text;
      }
    } catch {
      text = lesson.type === 'text' ? lesson.content.data : '';
    }
  }

  return {
    schemaVersion: 1,
    description: lesson.description || '',
    text,
    attachments,
    videoUrl: lesson.videoUrl || '',
  };
}
