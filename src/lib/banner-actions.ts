'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getUser, getSession } from '@/lib/auth';
import { r2 } from '@/lib/r2';
import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2 MB

type GetPresignedUrlParams = {
  type: string;
  size: number;
};

export async function getBannerPresignedUploadUrl({ type, size }: GetPresignedUrlParams) {
  if (!BUCKET_NAME || !PUBLIC_URL) {
    throw new Error('R2 bucket configuration is missing.');
  }

  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  if (!ALLOWED_FILE_TYPES.includes(type)) {
    throw new Error('File type not allowed');
  }

  if (size > MAX_FILE_SIZE) {
    throw new Error('File size too large');
  }

  const key = `banners/${user.username}/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: type,
    ContentLength: size,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });
  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { presignedUrl, publicUrl };
}

export async function updateUserBanner(bannerUrl: string) {
    const session = await getSession();
    if (!session?.accessToken) {
        throw new Error('Not authenticated');
    }

    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [{ Name: 'custom:banner', Value: bannerUrl }],
    });
    
    await cognitoClient.send(command);
    
    revalidatePath('/account');

    return { success: true };
}
