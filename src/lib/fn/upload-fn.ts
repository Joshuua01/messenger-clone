import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { s3 } from '../s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator(z.instanceof(FormData))
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
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

    const publicUrl = `${process.env.S3_ENDPOINT!.replace(
      '9000',
      '9001',
    )}/browser/${process.env.S3_BUCKET_NAME}/${fileName}`;

    return { url: publicUrl };
  });
