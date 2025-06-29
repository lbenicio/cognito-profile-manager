import type { User, UserPreferences } from '@/types/user/user.types';

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  fontSize: 12,
};

const nowInSeconds = Math.floor(Date.now() / 1000);

export const mockUser: User = {
  sub: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  username: 'testuser_dev',
  email: 'dev@example.com',
  email_verified: true,
  name: 'Dev User',
  address: '123 Dev Lane, Developer City, DS',
  phone_number: '+10000000000',
  phone_number_verified: true,
  birthdate: '1990-01-15',
  creationDate: new Date().toISOString(),
  userStatus: 'CONFIRMED',
  twoFactorEnabled: false,
  passkeysEnabled: true,
  groups: ['users', 'beta-testers'],
  isAdmin: false,
  picture: `https://placehold.co/128x128.png`,
  banner: `https://placehold.co/1500x500.png`,
  locale: 'en-US',
  zoneinfo: 'America/New_York',
  website: 'https://example.com',
  gender: 'Prefer not to say',
  aboutMe:
    'This is a mock user bio for the development environment. I enjoy coding and building cool things with Next.js.',
  preferences: defaultPreferences,
  notificationPreferences: {
    email: true,
    app: true,
    telegram: false,
    user: true,
    system: true,
    marketing: false,
  },
  publicProfilePreferences: {
    isPublic: true,
    publicFields: {
      picture: true,
      banner: true,
      name: true,
      groups: true,
      email: true,
      website: true,
      aboutMe: true,
      phone_number: false,
      gender: true,
      birthdate: true,
      zoneinfo: true,
      locale: true,
    },
  },
  fingerprint: [
    {
      date: new Date().toISOString(),
      ip: '127.0.0.1',
      device:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    {
      date: new Date(Date.now() - 86400000).toISOString(),
      ip: '192.168.1.1',
      device:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    },
  ],
  devices: [
    {
      key: 'mock_device_1',
      name: 'Passkey on macOS',
      createDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastAuthDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  sessionStartedAt: nowInSeconds,
  sessionExpiresAt: nowInSeconds + 3600, // Expires in 1 hour
  messages: [
    'Your subscription is expiring soon. Please update your payment method.',
    'A new login was detected from an unrecognized device.',
  ],
};

export const mockAdminUser: User = {
  ...mockUser,
  sub: 'a1b2c3d4-e5f6-7890-1234-567890fedcba',
  username: 'adminuser_dev',
  name: 'Admin User',
  groups: ['users', process.env.COGNITO_ADMIN_GROUP_NAME || 'admins'],
  isAdmin: true,
  twoFactorEnabled: true,
  passkeysEnabled: true,
  devices: mockUser.devices,
  messages: [
    'You have new administrative tasks pending your review.',
    'System maintenance is scheduled for this weekend.',
  ],
};

/**
 * Retrieves mock data from an in-memory cache.
 * In a real-world scenario, this might fetch from a test database.
 */
export function getMockUser(username?: string): User {
  if (username === mockAdminUser.username) {
    return mockAdminUser;
  }
  return mockUser;
}

export function getCache<T>(key: string): Promise<T | null> {
  // This is a mock function to replace Redis in a non-server-only context
  // It doesn't do anything in this mock implementation.
  return Promise.resolve(null);
}
