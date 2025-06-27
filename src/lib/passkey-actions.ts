'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, ForgetDeviceCommand } from './cognito';
import { getSession } from './auth';

export async function deletePasskey(
  deviceKey: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  if (!deviceKey) {
    return { success: false, message: 'Device key is required.' };
  }

  try {
    const command = new ForgetDeviceCommand({
      AccessToken: session.access_token,
      DeviceKey: deviceKey,
    });
    await cognitoClient.send(command);

    // Revalidate the security page to force a refetch of the device list.
    revalidatePath('/security');
    // Also revalidate the main page since it shows security status.
    revalidatePath('/');

    return { success: true, message: 'Passkey deleted successfully.' };
  } catch (error: any) {
    console.error('Delete Passkey Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the passkey.',
    };
  }
}
