'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './session-cookie';
import { Logger } from '@/lib/logger';

const logger = new Logger('MESSAGES');

export async function clearMessages(): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await getSession();
  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      // Setting the attribute with an empty JSON array string
      UserAttributes: [{ Name: 'custom:warnings', Value: '[]' }],
    });
    await cognitoClient.send(command);

    // Revalidate all relevant paths to reflect the change immediately
    revalidatePath('/', 'layout');

    return { success: true, message: 'Messages cleared successfully.' };
  } catch (error: any) {
    logger.error('Clear Messages Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while clearing messages.',
    };
  }
}
