
'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, DeleteWebAuthnCredentialCommand, ListWebAuthnCredentialsCommand, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './auth';

export async function deletePasskey(
  credentialId: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  if (!credentialId) {
    return { success: false, message: 'Credential ID is required.' };
  }

  try {
    const deleteCommand = new DeleteWebAuthnCredentialCommand({
      AccessToken: session.access_token,
      CredentialId: credentialId,
    });
    await cognitoClient.send(deleteCommand);

    // After deleting, check if any credentials remain.
    const listCredentialsCommand = new ListWebAuthnCredentialsCommand({
        AccessToken: session.access_token,
    });
    const credentialsResponse = await cognitoClient.send(listCredentialsCommand);

    if (!credentialsResponse.Credentials || credentialsResponse.Credentials.length === 0) {
        // If no credentials are left, update the custom attribute.
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
