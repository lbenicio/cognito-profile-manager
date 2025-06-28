
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session')?.value;
  
  if (sessionCookie) {
    try {
        const session = JSON.parse(sessionCookie);
        const refreshToken = session.refresh_token;

        if (refreshToken) {
            const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
            const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
            const clientSecret = process.env.COGNITO_CLIENT_SECRET;

            if (wellknownUrl && clientId) {
                const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
                if (wellknownResponse.ok) {
                    const wellknown = await wellknownResponse.json();
                    const revokeEndpoint = wellknown.revocation_endpoint;
                    
                    if (revokeEndpoint) {
                        const params = new URLSearchParams({ token: refreshToken, client_id: clientId });
                        const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded' };

                        // Add Authorization header only if it's a confidential client
                        if (clientSecret) {
                            const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                            headers['Authorization'] = `Basic ${authString}`;
                        }
                        
                        // We await this but don't let it block logout if it fails.
                        await fetch(revokeEndpoint, {
                            method: 'POST',
                            headers,
                            body: params.toString(),
                        }).catch(e => console.error("Background token revocation failed:", e));
                    }
                }
            }
        }
    } catch (e) {
        console.error("Could not parse session cookie for logout revocation:", e);
    }
  }

  // Always clear local cookies and respond successfully.
  const response = NextResponse.json({ success: true });
  
  const isProd = process.env.NODE_ENV === 'production';
  const appUrl = process.env.APP_URL;
  const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;

  response.cookies.set('auth_session', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });
  response.cookies.set('oauth_state', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });
  return response;
}
