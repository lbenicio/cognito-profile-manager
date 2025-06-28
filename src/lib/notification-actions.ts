'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './session';
import { Logger } from '@/lib/logger';

const logger = new Logger('NOTIFICATION');
import type { NotificationPreferences } from './auth';

export async function updateNotificationPreferences(
  newPreferences: NotificationPreferences
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();

  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [
        {
          Name: 'custom:email-notification',
          Value: String(newPreferences.email),
        },
        { Name: 'custom:app-notification', Value: String(newPreferences.app) },
        {
          Name: 'custom:tlgm-notification',
          Value: String(newPreferences.telegram),
        },
        {
          Name: 'custom:user-notifications',
          Value: String(newPreferences.user),
        },
        {
          Name: 'custom:system-notifications',
          Value: String(newPreferences.system),
        },
        {
          Name: 'custom:mkt-notifications',
          Value: String(newPreferences.marketing),
        },
      ],
    });

    await cognitoClient.send(command);

    revalidatePath('/settings');

    return {
      success: true,
      message: 'Notification preferences updated successfully.',
    };
  } catch (error: any) {
    logger.error('Update Notification Preferences Error:', error);
    return {
      success: false,
      message:
        'An unexpected error occurred while updating your notification preferences.',
    };
  }
}
