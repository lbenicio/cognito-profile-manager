'use server';

import { revalidatePath } from 'next/cache';
import {
  cognitoClient,
  ChangePasswordCommand,
  NotAuthorizedException,
  InvalidPasswordException,
} from '../lib/cognito';
import { getSession } from '../lib/session';
import { Logger } from '@/lib/logger';

const logger = new Logger('PASSWORD');

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  errorType?: 'currentPassword' | 'newPassword';
  message: string;
}> {
  const session = await getSession();
  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const command = new ChangePasswordCommand({
      AccessToken: session.accessToken,
      PreviousPassword: currentPassword,
      ProposedPassword: newPassword,
    });
    await cognitoClient.send(command);
    return { success: true, message: 'Password changed successfully.' };
  } catch (error: any) {
    logger.error('Change Password Error:', error);
    if (error instanceof NotAuthorizedException) {
      return {
        success: false,
        errorType: 'currentPassword',
        message: 'Incorrect current password. Please try again.',
      };
    }
    if (error instanceof InvalidPasswordException) {
      return {
        success: false,
        errorType: 'newPassword',
        message:
          error.message ||
          'New password does not meet the security requirements.',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred while changing the password.',
    };
  }
}
