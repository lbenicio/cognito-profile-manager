'use server';

import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { revalidatePath } from 'next/cache';
import { cognitoClient } from './cognito';
import { getSession } from './auth';

export async function enablePasskey(): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session?.access_token) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const command = new UpdateUserAttributesCommand({
            AccessToken: session.access_token,
            UserAttributes: [
                { Name: 'custom:pless', Value: 'true' },
            ],
        });
        await cognitoClient.send(command);

        // Revalidate paths that show user info to ensure data is fresh on subsequent navigations
        revalidatePath('/');
        revalidatePath('/profile');

        return { success: true, message: 'Passkey status enabled successfully.' };

    } catch (error: any) {
        console.error('Enable Passkey Error:', error);
        return { success: false, message: 'An unexpected error occurred while enabling passkey status.' };
    }
}
