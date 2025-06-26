import 'server-only';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.AWS_REGION;
if (!region) {
    throw new Error('AWS_REGION is not set in environment variables');
}

export const cognitoClient = new CognitoIdentityProviderClient({
    region,
});
