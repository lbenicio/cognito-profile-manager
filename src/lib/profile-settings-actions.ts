'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession, type PublicProfilePreferences } from './auth';

export async function updatePublicProfilePreferences(
  newPreferences: PublicProfilePreferences
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();

  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const preferencesJson = JSON.stringify(newPreferences);

    const command = new UpdateUserAttributesCommand({
      AccessToken: session.access_token,
      UserAttributes: [
        { Name: 'custom:public-profile', Value: preferencesJson },
      ],
    });

    await cognitoClient.send(command);
    
    revalidatePath('/profile');

    return { success: true, message: 'Profile settings updated successfully.' };
  } catch (error: any) {
    console.error('Update Public Profile Preferences Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while updating your profile settings.',
    };
  }
}
