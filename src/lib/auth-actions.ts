'use server';

import { redirect } from '@/navigation';
import { createSession } from '@/lib/session';
import { mockAdminUser } from '@/lib/auth';

export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }

  const sessionData = {
    isMock: true,
    username: 'admin',
    claims: {
        sub: mockAdminUser.sub,
        email: mockAdminUser.email,
        name: mockAdminUser.name,
    }
  };

  await createSession(sessionData, 3600); // Mock session for 1 hour
  redirect('/');
}
