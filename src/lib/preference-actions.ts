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

  if (!session || !user) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const existingPreferences = user.preferences;
    const mergedPreferences = { ...existingPreferences, ...newPreferences };
    const preferencesJson = JSON.stringify(mergedPreferences);

    const command = new UpdateUserAttributesCommand({
      AccessToken: session.access_token,
      UserAttributes: [{ Name: 'custom:session', Value: preferencesJson }],
    });

    await cognitoClient.send(command);

    // If language was changed, set the cookie so next-intl picks it up on refresh
    if (newPreferences.language && locales.includes(newPreferences.language)) {
      cookies().set('NEXT_LOCALE', newPreferences.language);
    }
    
    // Revalidate paths to reflect changes immediately
    revalidatePath('/settings');
    revalidatePath('/', 'layout'); // Revalidate all pages using the root layout

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
