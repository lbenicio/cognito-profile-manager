import 'server-only';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  UpdateUserAttributesCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  ChangePasswordCommand,
  InvalidPasswordException,
  NotAuthorizedException,
  ListDevicesCommand,
  ForgetDeviceCommand,
  ListWebAuthnCredentialsCommand,
  DeleteWebAuthnCredentialCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.AWS_REGION;
if (!region) {
  throw new Error('AWS_REGION is not set in environment variables');
}

export const cognitoClient = new CognitoIdentityProviderClient({
  region,
});

// Re-export all the necessary commands and exceptions from one central place
export {
  GetUserCommand,
  UpdateUserAttributesCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  ChangePasswordCommand,
  InvalidPasswordException,
  NotAuthorizedException,
  ListDevicesCommand,
  ForgetDeviceCommand,
  ListWebAuthnCredentialsCommand,
  DeleteWebAuthnCredentialCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
};
