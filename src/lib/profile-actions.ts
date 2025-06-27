'use server';

import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { revalidatePath } from 'next/cache';
import { cognitoClient } from './cognito';
import { getSession } from './auth';

type UserProfileAttributes = {
    given_name: string;
    family_name: string;
    address: string;
    phone_number: string;
    website: string;
    zoneinfo: string;
}

export async function updateUserProfile(data: UserProfileAttributes): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session?.access_token) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const command = new UpdateUserAttributesCommand({
            AccessToken: session.access_token,
            UserAttributes: [
                { Name: 'given_name', Value: data.given_name },
                { Name: 'family_name', Value: data.family_name },
                { Name: 'address', Value: data.address },
                { Name: 'phone_number', Value: data.phone_number },
                { Name: 'website', Value: data.website },
                { Name: 'zoneinfo', Value: data.zoneinfo },
                // We combine given and family name for the 'name' attribute which is often used for display
                { Name: 'name', Value: `${data.given_name} ${data.family_name}`.trim() },
            ],
        });
        await cognitoClient.send(command);

        // Revalidate paths that show user info to ensure data is fresh on subsequent navigations
        revalidatePath('/');
        revalidatePath('/profile');

        return { success: true, message: 'Profile updated successfully.' };

    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return { success: false, message: 'An unexpected error occurred while updating the profile.' };
    }
}
