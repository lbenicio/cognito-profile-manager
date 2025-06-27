import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const requestUrl = new URL(request.url);
  const profileUrl = new URL('/profile', requestUrl.origin);

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('Passkey callback state mismatch or state missing.');
    // You can optionally add an error to the query params to display on the profile page
    // profileUrl.searchParams.set('error', 'invalid_state');
  }

  // Clear the state cookie regardless of outcome
  const response = NextResponse.redirect(profileUrl);
  response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

  return response;
}
