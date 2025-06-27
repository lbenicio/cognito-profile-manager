'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, ForgetDeviceCommand, ListDevicesCommand, UpdateUserAttributesCommand } from './cognito';
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
    const forgetCommand = new ForgetDeviceCommand({
      AccessToken: session.access_token,
      DeviceKey: deviceKey,
    });
    await cognitoClient.send(forgetCommand);

    // After deleting, check if any devices remain.
    const listDevicesCommand = new ListDevicesCommand({
        AccessToken: session.access_token,
        Limit: 1, // We just need to know if the list is empty or not
    });
    const devicesResponse = await cognitoClient.send(listDevicesCommand);

    if (!devicesResponse.Devices || devicesResponse.Devices.length === 0) {
        // If no devices are left, update the custom attribute.
        const updateUserAttrCommand = new UpdateUserAttributesCommand({
            AccessToken: session.access_token,
            UserAttributes: [{
                Name: 'custom:pless',
                Value: 'false',
            }],
        });
        await cognitoClient.send(updateUserAttrCommand);
    }

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
