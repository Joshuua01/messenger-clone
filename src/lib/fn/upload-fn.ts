import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createServerFn } from '@tanstack/react-start';
import { randomUUID } from 'crypto';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';
import { s3 } from '../s3';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;
export const ATTACHMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/x-zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/x-gzip',
  'application/gzip',
  'application/x-rar-compressed',
  'application/vnd.rar',
];

export const uploadImageFn = createServerFn({ method: 'POST' })
  .middleware([withAuth])
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'avatar' | 'group';
    const currentImage = formData.get('currentImage') as string | null;

    if (!file) throw new Error('No file provided');

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('File too large. Maximum size is 5MB');
    }

    if (currentImage) {
      await deleteImageFn({ data: { imageUrl: currentImage } });
    }

    const prefix = type + '/';
    const url = await uploadFileToS3(file, process.env.S3_IMAGE_BUCKET!, prefix);

    return { url };
  });

export const uploadMessageAttachmentFn = createServerFn({ method: 'POST' })
  .middleware([withAuth])
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData }) => {
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed');
    }

    const result = [];

    for (const file of files) {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!ATTACHMENT_ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF, TXT');
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        throw new Error('File too large. Maximum size is 15MB');
      }

      const publicUrl = await uploadFileToS3(file, process.env.S3_ATTACHMENT_BUCKET!);
      result.push({ url: publicUrl, name: file.name, type: file.type });
    }

    return result;
  });

export const deleteImageFn = createServerFn({ method: 'POST' })
  .middleware([withAuth])
  .inputValidator(z.object({ imageUrl: z.string() }))
  .handler(async ({ data: { imageUrl } }) => {
    const bucket = process.env.S3_IMAGE_BUCKET!;
    const imageKey = imageUrl.split(`${bucket}/`)[1];

    const deleteObject = await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: imageKey,
      }),
    );

    if (deleteObject.$metadata.httpStatusCode !== 204) {
      throw new Error('Image deletion failed');
    }

    return { success: true };
  });

async function uploadFileToS3(file: File, bucket: string, prefix: string = ''): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileName = `${randomUUID()}-${file.name}`;
  const key = prefix + fileName;

  const upload = await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    }),
  );

  if (upload.$metadata.httpStatusCode !== 200) {
    throw new Error('File upload failed');
  }

  return `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
}
