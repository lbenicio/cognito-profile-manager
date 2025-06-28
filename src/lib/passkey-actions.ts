'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, DeleteWebAuthnCredentialCommand, ListWebAuthnCredentialsCommand, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './auth';

export async function deletePasskey(
  credentialId: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  if (!credentialId) {
    return { success: false, message: 'Credential ID is required.' };
  }

  try {
    const deleteCommand = new DeleteWebAuthnCredentialCommand({
      AccessToken: session.accessToken,
      CredentialId: credentialId,
    });
    await cognitoClient.send(deleteCommand);

    const listCredentialsCommand = new ListWebAuthnCredentialsCommand({
        AccessToken: session.accessToken,
    });
    const credentialsResponse = await cognitoClient.send(listCredentialsCommand);

    if (!credentialsResponse.Credentials || credentialsResponse.Credentials.length === 0) {
        const updateUserAttrCommand = new UpdateUserAttributesCommand({
            AccessToken: session.accessToken,
            UserAttributes: [{
                Name: 'custom:pless',
                Value: 'false',
            }],
        });
        await cognitoClient.send(updateUserAttrCommand);
    }

    revalidatePath('/security');
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

export async function syncPasskeysEnabledFlag(): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session?.accessToken) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    const command = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [{
        Name: 'custom:pless',
        Value: 'true',
      }],
    });
    await cognitoClient.send(command);

    revalidatePath('/security');
    revalidatePath('/');

    return { success: true, message: 'Passkey flag synced successfully.' };
  } catch (error: any) {
    console.error('Error syncing passkey flag:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while syncing the passkey flag.',
    };
  }
}
