'use server';

import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { revalidatePath } from 'next/cache';
import { cognitoClient } from './cognito';
import { getSession } from './auth';

export async function enablePasskey(accessToken?: string): Promise<{ success: boolean; message: string }> {
    let tokenToUse = accessToken;

    // If no token is passed directly, try to get it from the session cookie.
    if (!tokenToUse) {
        const session = await getSession();
        tokenToUse = session?.access_token;
    }
    
    if (!tokenToUse) {
        return { success: false, message: 'Not authenticated or access token missing.' };
    }

    try {
        const command = new UpdateUserAttributesCommand({
            AccessToken: tokenToUse,
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
