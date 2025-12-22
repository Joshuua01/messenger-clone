import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { withAuth } from '../middleware/auth-middleware';
import { s3 } from '../s3';
import { randomUUID } from 'crypto';

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

export const uploadAvatarFn = createServerFn({ method: 'POST' })
  .middleware([withAuth])
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData, context }) => {
    const file = formData.get('file') as File;
    const currentImage = context.user.image;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('File too large. Maximum size is 5MB');
    }

    if (currentImage) {
      await deleteAvatarFn({ data: { imageUrl: currentImage } });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${randomUUID()}-${file.name}`;

    const upload = await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_AVATAR_BUCKET!,
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      }),
    );

    if (upload.$metadata.httpStatusCode !== 200) {
      throw new Error('Image upload failed');
    }

    const publicUrl = `${process.env.S3_ENDPOINT!}/${process.env.S3_AVATAR_BUCKET}/${fileName}`;

    return { url: publicUrl };
  });

export const deleteAvatarFn = createServerFn({ method: 'POST' })
  .middleware([withAuth])
  .inputValidator(z.object({ imageUrl: z.string() }))
  .handler(async ({ data: { imageUrl } }) => {
    const urlParts = imageUrl.split('/');
    const imageKey = urlParts[urlParts.length - 1];

    const deleteObject = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_AVATAR_BUCKET!,
        Key: imageKey,
      }),
    );

    if (deleteObject.$metadata.httpStatusCode !== 204) {
      throw new Error('Image deletion failed');
    }

    return { success: true };
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

      const arrayBuffer = await file.arrayBuffer();
      const fileName = `${randomUUID()}-${file.name}`;

      const upload = await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_ATTACHMENT_BUCKET!,
          Key: fileName,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
        }),
      );

      if (upload.$metadata.httpStatusCode !== 200) {
        throw new Error('Attachment upload failed');
      }
      const publicUrl = `${process.env.S3_ENDPOINT!}/${process.env.S3_ATTACHMENT_BUCKET}/${fileName}`;
      result.push({ url: publicUrl, name: file.name, type: file.type });
    }

    return result;
  });
