/**
 * AWS Cognito-specific types and interfaces for Cognito integration.
 */

import type {
  CognitoIdentityProviderClient,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommandOutput,
  AdminDisableUserCommandOutput,
  AdminEnableUserCommandOutput,
  AdminResetUserPasswordCommandOutput,
  AdminSetUserPasswordCommandOutput,
  AdminAddUserToGroupCommandOutput,
  AdminRemoveUserFromGroupCommandOutput,
  GetUserCommandOutput,
  UpdateUserAttributesCommandOutput,
  ListWebAuthnCredentialsCommandOutput,
  ListDevicesCommandOutput,
  AttributeType,
  DeviceType,
  WebAuthnCredentialDescription,
} from '@aws-sdk/client-cognito-identity-provider';

/**
 * Cognito user attribute
 */
export interface CognitoUserAttribute {
  Name: string;
  Value: string;
}

/**
 * Cognito user attributes mapping
 */
export interface CognitoUserAttributes {
  sub: string;
  email: string;
  email_verified: string;
  username: string;
  name: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  phone_number_verified?: string;
  address?: string;
  birthdate?: string;
  gender?: string;
  locale?: string;
  zoneinfo?: string;
  website?: string;
  picture?: string;
  'custom:banner'?: string;
  'custom:aboutMe'?: string;
  'custom:isAdmin'?: string;
  'custom:twoFactorEnabled'?: string;
  'custom:passkeysEnabled'?: string;
  'custom:preferences'?: string;
  'custom:notificationPreferences'?: string;
  'custom:publicProfilePreferences'?: string;
}

/**
 * Cognito user status
 */
export type CognitoUserStatus =
  | 'UNCONFIRMED'
  | 'CONFIRMED'
  | 'ARCHIVED'
  | 'COMPROMISED'
  | 'UNKNOWN'
  | 'RESET_REQUIRED'
  | 'FORCE_CHANGE_PASSWORD'
  | 'EXTERNAL_PROVIDER';

/**
 * Cognito MFA options
 */
export type CognitoMfaType = 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' | 'WEB_AUTHN_MFA';

/**
 * Cognito device information
 */
export interface CognitoDevice {
  DeviceKey: string;
  DeviceAttributes?: AttributeType[];
  DeviceCreateDate?: Date;
  DeviceLastModifiedDate?: Date;
  DeviceLastAuthenticatedDate?: Date;
}

/**
 * Cognito WebAuthn credential
 */
export interface CognitoWebAuthnCredential {
  CredentialId: string;
  FriendlyCredentialName?: string;
  RelyingPartyId?: string;
  AuthenticatorAttachment?: string;
  AuthenticatorTransports?: string[];
  CreatedAt?: Date;
}

/**
 * Cognito error codes
 */
export type CognitoErrorCode =
  | 'UserNotFoundException'
  | 'InvalidParameterException'
  | 'InvalidPasswordException'
  | 'NotAuthorizedException'
  | 'TooManyRequestsException'
  | 'LimitExceededException'
  | 'ResourceNotFoundException'
  | 'CodeMismatchException'
  | 'ExpiredCodeException'
  | 'InvalidLambdaResponseException'
  | 'UnexpectedLambdaException'
  | 'UserLambdaValidationException'
  | 'InvalidSmsRoleAccessPolicyException'
  | 'InvalidSmsRoleTrustRelationshipException'
  | 'AliasExistsException'
  | 'PasswordResetRequiredException'
  | 'UserNotConfirmedException'
  | 'UsernameExistsException'
  | 'InternalErrorException'
  | 'ScopeDoesNotExistException'
  | 'InvalidUserPoolConfigurationException'
  | 'MFAMethodNotFoundException'
  | 'SoftwareTokenMFANotFoundException'
  | 'EnableSoftwareTokenMFAException'
  | 'ConcurrentModificationException'
  | 'DuplicateProviderException';

/**
 * Cognito error response
 */
export interface CognitoError extends Error {
  name: CognitoErrorCode;
  message: string;
  $fault?: 'client' | 'server';
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
    extendedRequestId?: string;
    cfId?: string;
  };
}

/**
 * Cognito token response
 */
export interface CognitoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

/**
 * Cognito user pool configuration
 */
export interface CognitoUserPoolConfig {
  UserPoolId: string;
  ClientId: string;
  Region: string;
  Domain?: string;
  CallbackURLs?: string[];
  LogoutURLs?: string[];
  SupportedIdentityProviders?: string[];
}

/**
 * Cognito identity pool configuration
 */
export interface CognitoIdentityPoolConfig {
  IdentityPoolId: string;
  IdentityPoolName: string;
  AllowUnauthenticatedIdentities: boolean;
  CognitoIdentityProviders?: Array<{
    ProviderName: string;
    ClientId: string;
    ServerSideTokenCheck?: boolean;
  }>;
}

/**
 * Cognito Lambda trigger configuration
 */
export interface CognitoLambdaTriggers {
  PreSignUp?: string;
  PostConfirmation?: string;
  PreAuthentication?: string;
  PostAuthentication?: string;
  PreTokenGeneration?: string;
  UserMigration?: string;
  CustomMessage?: string;
  DefineAuthChallenge?: string;
  CreateAuthChallenge?: string;
  VerifyAuthChallengeResponse?: string;
}

/**
 * Cognito user pool policy
 */
export interface CognitoUserPoolPolicy {
  PasswordPolicy?: {
    MinimumLength?: number;
    RequireUppercase?: boolean;
    RequireLowercase?: boolean;
    RequireNumbers?: boolean;
    RequireSymbols?: boolean;
    TemporaryPasswordValidityDays?: number;
  };
}

/**
 * Cognito MFA configuration
 */
export interface CognitoMfaConfiguration {
  MfaConfiguration: 'OFF' | 'ON' | 'OPTIONAL';
  SmsMfaConfiguration?: {
    SmsAuthenticationMessage?: string;
    SmsConfiguration?: {
      SnsCallerArn: string;
      ExternalId?: string;
    };
  };
  SoftwareTokenMfaConfiguration?: {
    Enabled?: boolean;
  };
}

/**
 * Cognito attribute verification configuration
 */
export interface CognitoVerificationConfig {
  AttributesRequireVerificationBeforeUpdate?: string[];
  AutoVerifiedAttributes?: Array<'phone_number' | 'email'>;
  VerificationMessageTemplate?: {
    SmsMessage?: string;
    EmailMessage?: string;
    EmailSubject?: string;
    EmailMessageByLink?: string;
    EmailSubjectByLink?: string;
    DefaultEmailOption?: 'CONFIRM_WITH_LINK' | 'CONFIRM_WITH_CODE';
  };
}

/**
 * Cognito group configuration
 */
export interface CognitoGroup {
  GroupName: string;
  UserPoolId: string;
  Description?: string;
  RoleArn?: string;
  Precedence?: number;
  LastModifiedDate?: Date;
  CreationDate?: Date;
}

/**
 * Cognito user session information
 */
export interface CognitoUserSession {
  AccessToken: {
    jwtToken: string;
    payload: Record<string, unknown>;
  };
  IdToken: {
    jwtToken: string;
    payload: Record<string, unknown>;
  };
  RefreshToken: {
    token: string;
  };
  ClockDrift: number;
}

/**
 * Cognito authentication flow types
 */
export type CognitoAuthFlow =
  | 'USER_SRP_AUTH'
  | 'ALLOW_USER_PASSWORD_AUTH'
  | 'ALLOW_USER_SRP_AUTH'
  | 'ALLOW_REFRESH_TOKEN_AUTH'
  | 'ALLOW_CUSTOM_AUTH'
  | 'ADMIN_NO_SRP_AUTH'
  | 'ADMIN_USER_PASSWORD_AUTH';

/**
 * Cognito challenge types
 */
export type CognitoChallengeType =
  | 'SMS_MFA'
  | 'SOFTWARE_TOKEN_MFA'
  | 'SELECT_MFA_TYPE'
  | 'MFA_SETUP'
  | 'PASSWORD_VERIFIER'
  | 'CUSTOM_CHALLENGE'
  | 'DEVICE_SRP_AUTH'
  | 'DEVICE_PASSWORD_VERIFIER'
  | 'ADMIN_NO_SRP_AUTH'
  | 'NEW_PASSWORD_REQUIRED'
  | 'WEB_AUTHN';

/**
 * Cognito challenge response
 */
export interface CognitoChallengeResponse {
  ChallengeName: CognitoChallengeType;
  ChallengeParameters?: Record<string, string>;
  Session?: string;
  AuthenticationResult?: {
    AccessToken: string;
    ExpiresIn: number;
    TokenType: string;
    RefreshToken?: string;
    IdToken?: string;
    NewDeviceMetadata?: {
      DeviceKey: string;
      DeviceGroupKey: string;
    };
  };
}

/**
 * Cognito admin operations
 */
export interface CognitoAdminOperations {
  createUser: (params: {
    Username: string;
    UserAttributes: CognitoUserAttribute[];
    TemporaryPassword?: string;
    MessageAction?: 'RESEND' | 'SUPPRESS';
  }) => Promise<AdminCreateUserCommandOutput>;

  deleteUser: (username: string) => Promise<AdminDeleteUserCommandOutput>;

  disableUser: (username: string) => Promise<AdminDisableUserCommandOutput>;

  enableUser: (username: string) => Promise<AdminEnableUserCommandOutput>;

  resetUserPassword: (
    username: string
  ) => Promise<AdminResetUserPasswordCommandOutput>;

  setUserPassword: (params: {
    Username: string;
    Password: string;
    Permanent?: boolean;
  }) => Promise<AdminSetUserPasswordCommandOutput>;

  addUserToGroup: (params: {
    Username: string;
    GroupName: string;
  }) => Promise<AdminAddUserToGroupCommandOutput>;

  removeUserFromGroup: (params: {
    Username: string;
    GroupName: string;
  }) => Promise<AdminRemoveUserFromGroupCommandOutput>;
}

/**
 * Cognito service interface
 */
export interface CognitoService {
  client: CognitoIdentityProviderClient;

  // User operations
  getUser(accessToken: string): Promise<GetUserCommandOutput>;
  updateUserAttributes(
    accessToken: string,
    attributes: AttributeType[]
  ): Promise<UpdateUserAttributesCommandOutput>;

  // Device operations
  listDevices(accessToken: string): Promise<ListDevicesCommandOutput>;
  forgetDevice(accessToken: string, deviceKey: string): Promise<void>;

  // WebAuthn operations
  listWebAuthnCredentials(
    accessToken: string
  ): Promise<ListWebAuthnCredentialsCommandOutput>;
  deleteWebAuthnCredential(
    accessToken: string,
    credentialId: string
  ): Promise<void>;

  // MFA operations
  associateSoftwareToken(accessToken: string): Promise<{ SecretCode: string }>;
  verifySoftwareToken(
    accessToken: string,
    userCode: string,
    friendlyDeviceName?: string
  ): Promise<void>;
  setUserMfaPreference(
    accessToken: string,
    preferences: {
      SMSMfaSettings?: { Enabled: boolean; PreferredMfa: boolean };
      SoftwareTokenMfaSettings?: { Enabled: boolean; PreferredMfa: boolean };
    }
  ): Promise<void>;

  // Password operations
  changePassword(
    accessToken: string,
    previousPassword: string,
    proposedPassword: string
  ): Promise<void>;
}

/**
 * Cognito configuration
 */
export interface CognitoConfig {
  region: string;
  userPoolId?: string;
  clientId: string;
  identityPoolId?: string;
  domain?: string;
  wellknownUrl: string;
  redirectUri: string;
  logoutUri: string;
  scope: string;
  responseType: string;
  authFlow: CognitoAuthFlow[];
}

/**
 * Default Cognito configuration
 */
export const DEFAULT_COGNITO_CONFIG: Partial<CognitoConfig> = {
  region: 'us-east-1',
  scope: 'openid email profile aws.cognito.signin.user.admin',
  responseType: 'code',
  authFlow: ['ALLOW_USER_SRP_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
};
