'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getUser } from '@/lib/auth';
import { r2 } from '@/lib/r2';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4 MB

type GetPresignedUrlParams = {
  type: string;
  size: number;
};

export async function getPresignedUploadUrl({ type, size }: GetPresignedUrlParams) {
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

  const key = `avatars/${user.username}/${randomUUID()}`;

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

// In a real app, this would call your auth provider (e.g., Cognito) to update the user's 'picture' attribute.
// For this prototype, we'll just log it and revalidate paths. A client-side state update handles the immediate UI change.
export async function updateUserAvatar(pictureUrl: string) {
    const user = await getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }
    console.log(`Updating avatar for ${user.username} to ${pictureUrl}. In a real app, this would call an API.`);
    // NOTE: This does not persist the change across sessions because `getUser` reads from an immutable JWT.
    // A full implementation requires updating the user profile in your identity provider.
    
    // Revalidate paths that show the user's avatar to ensure data consistency on navigation
    revalidatePath('/');
    revalidatePath('/profile');

    return { success: true };
}
