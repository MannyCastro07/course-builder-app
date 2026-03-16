import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MediaFile } from '../models/MediaFile';
import { ContentStatus } from '../types';
import { Queue } from 'bull';

// Configurar ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic as string);

// Configurar S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'course-platform-media';

// Cola de procesamiento de video
const videoProcessingQueue = new Queue('video-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

export class MediaService {
  // ============================================
  // CONFIGURACIÓN DE MULTER
  // ============================================
  static getUploadConfig() {
    const storage = multer.memoryStorage();

    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const allowedTypes = [
        // Imágenes
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // Videos
        'video/mp4',
        'video/webm',
        'video/quicktime',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        // Documentos
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 500 * 1024 * 1024 // 500MB máximo
      }
    });
  }

  // ============================================
  // SUBIDA DE ARCHIVOS
  // ============================================
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    metadata?: {
      courseId?: string;
      lessonId?: string;
    }
  ) {
    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${fileId}${extension}`;
    const key = `uploads/${userId}/${filename}`;

    // Subir a S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId
        }
      })
    );

    // Generar URL firmada (válida por 1 hora)
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }),
      { expiresIn: 3600 }
    );

    // Crear registro en la base de datos
    const mediaFile = await MediaFile.create({
      originalName: file.originalname,
      filename,
      path: key,
      url,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      course: metadata?.courseId,
      lesson: metadata?.lessonId,
      processingStatus: this.needsProcessing(file.mimetype)
        ? ContentStatus.PROCESSING
        : ContentStatus.READY
    });

    // Procesar archivo si es necesario
    if (this.needsProcessing(file.mimetype)) {
      await this.processFile(mediaFile._id!.toString(), file, key);
    }

    return mediaFile;
  }

  private needsProcessing(mimetype: string): boolean {
    return (
      mimetype.startsWith('image/') ||
      mimetype.startsWith('video/')
    );
  }

  // ============================================
  // PROCESAMIENTO DE ARCHIVOS
  // ============================================
  private async processFile(
    mediaFileId: string,
    file: Express.Multer.File,
    key: string
  ): Promise<void> {
    if (file.mimetype.startsWith('image/')) {
      await this.processImage(mediaFileId, file, key);
    } else if (file.mimetype.startsWith('video/')) {
      await this.processVideo(mediaFileId, key);
    }
  }

  private async processImage(
    mediaFileId: string,
    file: Express.Multer.File,
    key: string
  ): Promise<void> {
    try {
      const variants = [];

      // Generar variantes de imagen
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 300, height: 200 },
        { name: 'medium', width: 600, height: 400 },
        { name: 'large', width: 1200, height: 800 }
      ];

      for (const size of sizes) {
        const resizedBuffer = await sharp(file.buffer)
          .resize(size.width, size.height, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const variantKey = key.replace(
          path.extname(key),
          `-${size.name}${path.extname(key)}`
        );

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: variantKey,
            Body: resizedBuffer,
            ContentType: 'image/jpeg'
          })
        );

        const variantUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: variantKey
          }),
          { expiresIn: 3600 }
        );

        variants.push({
          type: size.name,
          url: variantUrl,
          size: resizedBuffer.length,
          width: size.width,
          height: size.height
        });
      }

      // Obtener metadatos
      const metadata = await sharp(file.buffer).metadata();

      // Actualizar registro
      await MediaFile.findByIdAndUpdate(mediaFileId, {
        processingStatus: ContentStatus.READY,
        variants,
        metadata: {
          width: metadata.width,
          height: metadata.height
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      await MediaFile.findByIdAndUpdate(mediaFileId, {
        processingStatus: ContentStatus.ERROR
      });
    }
  }

  private async processVideo(mediaFileId: string, key: string): Promise<void> {
    // Agregar a la cola de procesamiento
    await videoProcessingQueue.add({
      mediaFileId,
      key,
      bucket: BUCKET_NAME
    });
  }

  // ============================================
  // PROCESAMIENTO DE VIDEO (WORKER)
  // ============================================
  static async processVideoJob(job: any): Promise<void> {
    const { mediaFileId, key, bucket } = job.data;

    try {
      // Descargar video de S3
      const tempInputPath = `/tmp/${path.basename(key)}`;
      const tempOutputDir = `/tmp/output-${mediaFileId}`;

      // Aquí iría el código para descargar de S3
      // y procesar con ffmpeg

      const resolutions = [
        { quality: '240p', width: 426, height: 240, bitrate: '400k' },
        { quality: '360p', width: 640, height: 360, bitrate: '800k' },
        { quality: '480p', width: 854, height: 480, bitrate: '1200k' },
        { quality: '720p', width: 1280, height: 720, bitrate: '2500k' },
        { quality: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
      ];

      const variants = [];

      for (const res of resolutions) {
        const outputPath = `${tempOutputDir}/${res.quality}.mp4`;

        await new Promise((resolve, reject) => {
          ffmpeg(tempInputPath)
            .size(`${res.width}x${res.height}`)
            .videoBitrate(res.bitrate)
            .audioBitrate('128k')
            .format('mp4')
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
        });

        // Subir a S3
        const variantKey = key.replace(
          path.extname(key),
          `-${res.quality}.mp4`
        );

        // Aquí iría el código para subir a S3

        variants.push({
          type: res.quality,
          url: `https://${bucket}.s3.amazonaws.com/${variantKey}`,
          size: 0 // Calcular tamaño real
        });
      }

      // Generar thumbnail
      const thumbnailPath = `${tempOutputDir}/thumbnail.jpg`;
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .screenshots({
            timestamps: ['10%'],
            filename: 'thumbnail.jpg',
            folder: tempOutputDir,
            size: '640x360'
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Obtener duración y metadatos
      const metadata: any = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(tempInputPath, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      const duration = metadata.format.duration;
      const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');

      // Actualizar registro
      await MediaFile.findByIdAndUpdate(mediaFileId, {
        processingStatus: ContentStatus.READY,
        variants,
        metadata: {
          duration,
          width: videoStream?.width,
          height: videoStream?.height,
          codec: videoStream?.codec_name,
          bitrate: metadata.format.bit_rate,
          fps: eval(videoStream?.r_frame_rate || '0')
        }
      });

      // Limpiar archivos temporales
      // fs.rmSync(tempOutputDir, { recursive: true });
      // fs.unlinkSync(tempInputPath);

    } catch (error) {
      console.error('Error processing video:', error);
      await MediaFile.findByIdAndUpdate(mediaFileId, {
        processingStatus: ContentStatus.ERROR
      });
      throw error;
    }
  }

  // ============================================
  // STREAMING DE VIDEO
  // ============================================
  async getVideoStreamUrl(
    mediaFileId: string,
    quality?: string
  ): Promise<string | null> {
    const mediaFile = await MediaFile.findById(mediaFileId);

    if (!mediaFile || !mediaFile.isVideo()) {
      return null;
    }

    // Si se solicita una calidad específica
    if (quality && mediaFile.variants) {
      const variant = mediaFile.variants.find(v => v.type === quality);
      if (variant) {
        return variant.url;
      }
    }

    // Retornar URL original
    return mediaFile.url;
  }

  // ============================================
  // ELIMINACIÓN DE ARCHIVOS
  // ============================================
  async deleteFile(mediaFileId: string, userId: string): Promise<boolean> {
    const mediaFile = await MediaFile.findOne({
      _id: mediaFileId,
      uploadedBy: userId
    });

    if (!mediaFile) {
      return false;
    }

    // Eliminar de S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: mediaFile.path
      })
    );

    // Eliminar variantes
    if (mediaFile.variants) {
      for (const variant of mediaFile.variants) {
        const variantKey = mediaFile.path.replace(
          path.basename(mediaFile.path),
          path.basename(variant.url)
        );
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: variantKey
          })
        );
      }
    }

    // Eliminar de la base de datos
    await MediaFile.findByIdAndDelete(mediaFileId);

    return true;
  }

  // ============================================
  // GENERAR URL FIRMADA
  // ============================================
  async generateSignedUrl(
    mediaFileId: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const mediaFile = await MediaFile.findById(mediaFileId);

    if (!mediaFile) {
      return null;
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: mediaFile.path
      }),
      { expiresIn }
    );

    return url;
  }
}

// Exportar cola para uso en workers
export { videoProcessingQueue };
