'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from '../lib/cognito';
import { getSession } from '../lib/session';
import { Logger } from '@/lib/logger';

const logger = new Logger('MESSAGES');

export async function clearMessages(): Promise<void> {
  const session = await getSession();
  if (!session?.accessToken) {
    logger.error('Attempted to clear messages without an active session.');
    return;
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
  } catch (error: any) {
    logger.error('Clear Messages Error:', error);
    // The action will fail, but the user will see the old state.
    // In a real app, you might want to throw an error to be caught by an error boundary.
  }
}
