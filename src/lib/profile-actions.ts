'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './auth';

type UserProfileAttributes = {
    given_name: string;
    family_name: string;
    address: string;
    phone_number: string;
    birthdate?: string;
    website: string;
    zoneinfo: string;
    gender: string;
    aboutMe: string;
}

export async function updateUserProfile(data: UserProfileAttributes): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const attributesToUpdate = [
            { Name: 'given_name', Value: data.given_name },
            { Name: 'family_name', Value: data.family_name },
            { Name: 'phone_number', Value: data.phone_number },
            { Name: 'website', Value: data.website },
            { Name: 'zoneinfo', Value: data.zoneinfo },
            { Name: 'gender', Value: data.gender },
            { Name: 'custom:aboutme', Value: data.aboutMe },
            { Name: 'name', Value: `${data.given_name} ${data.family_name}`.trim() },
        ];

        if (data.birthdate) {
            attributesToUpdate.push({ Name: 'birthdate', Value: data.birthdate });
        }
        if (data.address) {
            attributesToUpdate.push({ Name: 'address', Value: data.address });
        }


        const command = new UpdateUserAttributesCommand({
            AccessToken: session.access_token,
            UserAttributes: attributesToUpdate,
        });
        await cognitoClient.send(command);

        // Revalidate paths that show user info to ensure data is fresh on subsequent navigations
        revalidatePath('/');
        revalidatePath('/account');
        revalidatePath('/profile');

        return { success: true, message: 'Profile updated successfully.' };

    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return { success: false, message: 'An unexpected error occurred while updating the profile.' };
    }
}

export async function updateUserAddress(address: string): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const command = new UpdateUserAttributesCommand({
            AccessToken: session.access_token,
            UserAttributes: [
                { Name: 'address', Value: address },
            ],
        });
        await cognitoClient.send(command);
        
        revalidatePath('/account');

        return { success: true, message: 'Address updated successfully.' };

    } catch (error: any) {
        console.error('Update Address Error:', error);
        return { success: false, message: 'An unexpected error occurred while updating the address.' };
    }
}
