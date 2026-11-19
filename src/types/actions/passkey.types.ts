import type { ListWebAuthnCredentialsCommandOutput } from '@aws-sdk/client-cognito-identity-provider';

export type CognitoPasskeyList = NonNullable<
  ListWebAuthnCredentialsCommandOutput['Credentials']
>;

export type ListCognitoPasskeysResult =
  | {
      success: true;
      message: string;
      data: CognitoPasskeyList;
    }
  | {
      success: false;
      message: string;
      data?: never;
    };
