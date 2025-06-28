
'use server';

import { revalidatePath } from 'next/cache';
import { cognitoClient, UpdateUserAttributesCommand } from './cognito';
import { getSession } from './auth';

type UserProfileAttributes = {
    given_name: string;
    family_name: string;
    phone_number: string;
    birthdate?: string;
    website: string;
    zoneinfo: string;
    gender: string;
    aboutMe: string;
}

export async function updateUserProfile(data: Partial<UserProfileAttributes>): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session?.accessToken) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const attributesToUpdate = Object.entries(data)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => {
            const cognitoKey = key === 'aboutMe' ? 'custom:aboutme' : key;
            return { Name: cognitoKey, Value: String(value) };
          });
        
        // Ensure name attribute is always updated if given_name or family_name changes
        if(data.given_name || data.family_name) {
            const user = await getSession();
            const currentName = user?.claims?.name as string || '';
            const [currentGiven, ...currentFamily] = currentName.split(' ');
            const newGiven = data.given_name || currentGiven;
            const newFamily = data.family_name || currentFamily.join(' ');
            attributesToUpdate.push({ Name: 'name', Value: `${newGiven} ${newFamily}`.trim() });
        }

        if (attributesToUpdate.length === 0) {
            return { success: true, message: 'No changes to update.' };
        }

        const command = new UpdateUserAttributesCommand({
            AccessToken: session.accessToken,
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
    if (!session?.accessToken) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const command = new UpdateUserAttributesCommand({
            AccessToken: session.accessToken,
            UserAttributes: [
                { Name: 'address', Value: address },
            ],
        });
        await cognitoClient.send(command);
        
        revalidatePath('/account');
        revalidatePath('/profile');

        return { success: true, message: 'Address updated successfully.' };

    } catch (error: any) {
        console.error('Update Address Error:', error);
        return { success: false, message: 'An unexpected error occurred while updating the address.' };
    }
}
