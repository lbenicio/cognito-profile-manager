/**
 * User-related types for the application.
 */

import type { JWTPayload } from 'jose';

/**
 * User Preferences
 */
export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'pt';
  fontSize: number;
};

/**
 * Notification Preferences
 */
export type NotificationPreferences = {
  email: boolean;
  app: boolean;
  telegram: boolean;
  user: boolean;
  system: boolean;
  marketing: boolean;
};

/**
 * Public Profile Preferences
 */
export type PublicProfilePreferences = {
  isPublic: boolean;
  publicFields: {
    picture: boolean;
    banner: boolean;
    name: boolean;
    groups: boolean;
    email: boolean;
    website: boolean;
    aboutMe: boolean;
    phone_number: boolean;
    gender: boolean;
    birthdate: boolean;
    zoneinfo: boolean;
    locale: boolean;
  };
};

/**
 * Device information for passkeys or other authentication devices
 */
export type Device = {
  key: string;
  name: string;
  createDate?: string;
  lastAuthDate?: string;
};

/**
 * Fingerprint information for login activity
 */
export type Fingerprint = {
  date: string; // ISO string
  ip: string;
  device: string;
};

/**
 * Main User type
 */
export type User = {
  sub: string;
  username: string;
  email: string;
  email_verified: boolean;
  name: string;
  address: string;
  phone_number: string;
  phone_number_verified: boolean;
  birthdate: string;
  creationDate: string; // ISO string
  userStatus: string;
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
  groups: string[];
  isAdmin: boolean;
  picture: string;
  banner: string;
  locale: string;
  zoneinfo: string;
  website: string;
  gender: string;
  aboutMe: string;
  preferences: UserPreferences;
  notificationPreferences: NotificationPreferences;
  publicProfilePreferences: PublicProfilePreferences;
  fingerprint: Fingerprint[];
  devices: Device[];
  sessionStartedAt: number; // Unix timestamp (seconds)
  sessionExpiresAt: number; // Unix timestamp (seconds)
};

/**
 * Session type for authentication/session management
 */
export type Session = {
  accessToken: string;
  refreshToken: string;
  claims: JWTPayload;
  isMock?: boolean;
  username?: string;
  sessionId: string;
} | null;
