'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from '../cognito';
import { getSession } from '../session';
import type { PublicProfilePreferences } from '@/types/user/user.types';
import { Logger } from '@/lib/logger';

const logger = new Logger('PROFILE-SETTINGS');

export async function updatePublicProfilePreferences(
  newPreferences: PublicProfilePreferences
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();

  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const preferencesJson = JSON.stringify(newPreferences);

    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [
        { Name: 'custom:public-profile', Value: preferencesJson },
      ],
    });

    await cognitoClient.send(command);

    revalidatePath('/profile');

    return { success: true, message: 'Profile settings updated successfully.' };
  } catch (error: any) {
    logger.error('Update Public Profile Preferences Error:', error);
    return {
      success: false,
      message:
        'An unexpected error occurred while updating your profile settings.',
    };
  }
}
