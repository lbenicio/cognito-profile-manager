'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession, getUser, type UserPreferences } from './auth';
import { locales } from '@/navigation';

export async function updateUserPreferences(
  newPreferences: Partial<UserPreferences>
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  const user = await getUser();

  if (!session?.accessToken || !user) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const existingPreferences = user.preferences;
    const mergedPreferences = { ...existingPreferences, ...newPreferences };
    const preferencesJson = JSON.stringify(mergedPreferences);

    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [{ Name: 'custom:session', Value: preferencesJson }],
    });

    await cognitoClient.send(command);

    if (newPreferences.language && locales.includes(newPreferences.language)) {
      cookies().set('NEXT_LOCALE', newPreferences.language);
    }
    
    revalidatePath('/settings');
    revalidatePath('/', 'layout');

    return { success: true, message: 'Preferences updated successfully.' };
  } catch (error: any) {
    console.error('Update Preferences Error:', error);
    return {
      success: false,
      message:
        'An unexpected error occurred while updating your preferences.',
    };
  }
}
