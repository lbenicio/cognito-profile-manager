#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

console.log('🧪 Testing Authentication Flow for Cognito Profile Manager\n');

const BASE_URL = 'http://localhost:9002';

/**
 * Make HTTP request and return response details
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'auth-flow-test/1.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers,
      },
      ...options,
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data,
          cookies: res.headers['set-cookie'] || [],
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Test server availability
 */
async function testServerAvailability() {
  console.log('1. Testing server availability...');
  try {
    const response = await makeRequest(`${BASE_URL}/login`);
    if (response.statusCode === 200) {
      console.log('   ✅ Server is running and accessible');
      return true;
    } else {
      console.log(`   ❌ Server returned status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Server not accessible: ${error.message}`);
    return false;
  }
}

/**
 * Test SSO start endpoint
 */
async function testSSOStart() {
  console.log('\n2. Testing SSO start endpoint...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/auth/sso/start`);

    if (response.statusCode === 302) {
      const location = response.headers.location;
      console.log('   ✅ SSO start redirects correctly');
      console.log(`   📍 Redirect location: ${location}`);

      // Check if it's redirecting to error page (missing config) or Cognito
      if (location && location.includes('/login?error=')) {
        console.log(
          '   ⚠️  SSO redirected to error page (likely missing Cognito config)'
        );
        const url = new URL(location, BASE_URL);
        console.log(`   🔍 Error: ${url.searchParams.get('error')}`);
        console.log(
          `   📝 Description: ${url.searchParams.get('error_description')}`
        );
      } else if (location && location.includes('cognito')) {
        console.log(
          '   ✅ SSO redirected to Cognito (OAuth2 config is working)'
        );
      }

      // Check for oauth_state cookie
      const stateCookie = response.cookies.find((cookie) =>
        cookie.includes('oauth_state')
      );
      if (stateCookie) {
        console.log('   ✅ OAuth state cookie set for CSRF protection');
      } else {
        console.log('   ⚠️  No OAuth state cookie found');
      }
    } else {
      console.log(`   ❌ Expected redirect (302), got ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ SSO start failed: ${error.message}`);
  }
}

/**
 * Test logout endpoint without session
 */
async function testLogoutWithoutSession() {
  console.log('\n3. Testing logout endpoint without session...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/auth/logout`);

    if (response.statusCode === 302) {
      const location = response.headers.location;
      console.log('   ✅ Logout redirects correctly');
      console.log(`   📍 Redirect location: ${location}`);

      if (location && location.includes('/login')) {
        console.log('   ✅ Logout redirected to login page (correct behavior)');
      } else {
        console.log('   ⚠️  Logout did not redirect to login page');
      }
    } else {
      console.log(`   ❌ Expected redirect (302), got ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Logout test failed: ${error.message}`);
  }
}

/**
 * Test protected route without authentication
 */
async function testProtectedRouteWithoutAuth() {
  console.log('\n4. Testing protected route without authentication...');
  try {
    const response = await makeRequest(`${BASE_URL}/`);

    if (response.statusCode === 302) {
      const location = response.headers.location;
      console.log('   ✅ Protected route redirects correctly');
      console.log(`   📍 Redirect location: ${location}`);

      if (location && location.includes('/login')) {
        console.log('   ✅ Redirected to login page (middleware working)');
      } else {
        console.log('   ⚠️  Did not redirect to login page');
      }
    } else if (response.statusCode === 200) {
      console.log(
        '   ⚠️  Protected route accessible without auth (middleware issue?)'
      );
    } else {
      console.log(`   ❌ Unexpected status code: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Protected route test failed: ${error.message}`);
  }
}

/**
 * Test login page content
 */
async function testLoginPageContent() {
  console.log('\n5. Testing login page content...');
  try {
    const response = await makeRequest(`${BASE_URL}/login`);

    if (response.statusCode === 200) {
      console.log('   ✅ Login page loads correctly');

      const content = response.data;
      const hasSSO =
        content.includes('Sign In with SSO') ||
        content.includes('signInButton');
      const hasDevButtons =
        content.includes('Admin') ||
        content.includes('User') ||
        content.includes('Development Only');

      if (hasSSO) {
        console.log('   ✅ SSO login button found');
      } else {
        console.log('   ⚠️  SSO login button not found');
      }

      if (hasDevButtons) {
        console.log('   ✅ Development mock login buttons found');
      } else {
        console.log('   ⚠️  Development mock login buttons not found');
      }
    } else {
      console.log(`   ❌ Login page returned status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Login page test failed: ${error.message}`);
  }
}

/**
 * Test i18n functionality
 */
async function testInternationalization() {
  console.log('\n6. Testing internationalization...');
  try {
    const response = await makeRequest(`${BASE_URL}/login`, {
      headers: {
        'Accept-Language': 'es,en;q=0.9',
      },
    });

    if (response.statusCode === 200) {
      console.log('   ✅ i18n request processed');

      // Check for locale cookie
      const localeCookie = response.cookies.find((cookie) =>
        cookie.includes('locale=')
      );
      if (localeCookie) {
        console.log(`   ✅ Locale cookie set: ${localeCookie.split(';')[0]}`);
      } else {
        console.log('   ⚠️  No locale cookie found');
      }
    }
  } catch (error) {
    console.log(`   ❌ i18n test failed: ${error.message}`);
  }
}

/**
 * Test environment configuration
 */
function testEnvironmentConfiguration() {
  console.log('\n7. Testing environment configuration...');

  try {
    const fs = require('fs');
    const path = require('path');

    const envFile = path.join(process.cwd(), '.env.development.local');
    const envExists = fs.existsSync(envFile);

    if (envExists) {
      console.log('   ✅ .env.development.local file exists');

      const envContent = fs.readFileSync(envFile, 'utf8');
      const hasEncryptionKey = envContent.includes(
        'TOTP_SECRET_ENCRYPTION_KEY'
      );
      const hasAppUrl = envContent.includes('APP_URL');

      if (hasEncryptionKey) {
        console.log('   ✅ TOTP_SECRET_ENCRYPTION_KEY is configured');
      } else {
        console.log('   ❌ TOTP_SECRET_ENCRYPTION_KEY is missing');
      }

      if (hasAppUrl) {
        console.log('   ✅ APP_URL is configured');
      } else {
        console.log('   ❌ APP_URL is missing');
      }

      // Check for Cognito configuration
      const hasCognitoClientId = envContent.includes(
        'NEXT_PUBLIC_COGNITO_CLIENT_ID'
      );
      const hasCognitoWellKnown = envContent.includes(
        'NEXT_PUBLIC_COGNITO_WELLKNOWN'
      );

      if (
        hasCognitoClientId &&
        hasCognitoWellKnown &&
        !envContent.includes('# NEXT_PUBLIC_COGNITO_CLIENT_ID')
      ) {
        console.log('   ✅ Cognito OAuth2 configuration is active');
      } else {
        console.log(
          '   ⚠️  Cognito OAuth2 configuration is commented out (mock-only mode)'
        );
      }
    } else {
      console.log('   ❌ .env.development.local file not found');
      console.log('   💡 Run: npm run setup:dev');
    }
  } catch (error) {
    console.log(`   ❌ Environment test failed: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Starting authentication flow tests...\n');
  console.log(`Target server: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Test environment first
  testEnvironmentConfiguration();

  // Test server availability
  const serverAvailable = await testServerAvailability();
  if (!serverAvailable) {
    console.log(
      '\n❌ Server not available. Please start the development server:'
    );
    console.log('   npm run dev');
    process.exit(1);
  }

  // Run authentication flow tests
  await testLoginPageContent();
  await testInternationalization();
  await testProtectedRouteWithoutAuth();
  await testSSOStart();
  await testLogoutWithoutSession();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Authentication flow tests completed!');
  console.log('\n📋 Next steps for testing:');
  console.log('1. Open http://localhost:9002/login in browser');
  console.log('2. Test mock login with Admin/User buttons');
  console.log('3. Test logout functionality');
  console.log('4. For OAuth2 testing, configure Cognito environment variables');
  console.log('\n📚 See AUTHENTICATION.md for detailed setup instructions');
}

// Run if called directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('\n❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest };
