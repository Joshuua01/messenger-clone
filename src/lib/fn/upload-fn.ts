import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { s3 } from '../s3';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File;
    const currentImage = formData.get('currentImage') as string | null;
    if (!file) {
      throw new Error('No file provided');
    }

    if (currentImage) {
      const urlParts = currentImage.split('/');
      const oldImageName = urlParts[urlParts.length - 1];

      const imageDelete = await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: oldImageName,
        }),
      );

      if (imageDelete.$metadata.httpStatusCode !== 204) {
        throw new Error('Old image deletion failed');
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;

    const upload = await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      }),
    );

    if (upload.$metadata.httpStatusCode !== 200) {
      throw new Error('Image upload failed');
    }

    const publicUrl = `${process.env.S3_ENDPOINT!}/${process.env.S3_BUCKET_NAME}/${fileName}`;

    return { url: publicUrl };
  });
