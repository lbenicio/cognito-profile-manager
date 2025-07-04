#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

console.log('🧪 Testing Logout Behavior\n');

const BASE_URL = 'http://localhost:9002';

/**
 * Make HTTP request and return response details
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'logout-test/1.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers,
      },
    };

    const req = http.request(requestOptions, (res) => {
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

    req.end();
  });
}

/**
 * Test logout endpoint behavior
 */
async function testLogoutEndpoint() {
  console.log('1. Testing logout endpoint behavior...');

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/auth/logout`);

    console.log(
      `   📊 Status: ${response.statusCode} ${response.statusMessage}`
    );

    if (response.statusCode === 307 || response.statusCode === 302) {
      const location = response.headers.location;
      console.log(`   📍 Redirect location: ${location}`);

      if (location && location.includes('/login')) {
        console.log('   ✅ Redirects to our login page (CORRECT)');
      } else if (location && location.includes('cognito')) {
        console.log(
          '   ❌ Redirects to Cognito (INCORRECT - should be background call)'
        );
      } else {
        console.log('   ⚠️  Redirects to unexpected location');
      }
    } else {
      console.log('   ❌ Expected redirect response');
    }

    // Check cookie clearing
    const sessionCookie = response.cookies.find(
      (cookie) =>
        cookie.includes('session=') &&
        cookie.includes('Expires=Thu, 01 Jan 1970')
    );
    const stateCookie = response.cookies.find(
      (cookie) =>
        cookie.includes('oauth_state=') &&
        cookie.includes('Expires=Thu, 01 Jan 1970')
    );

    if (sessionCookie) {
      console.log('   ✅ Session cookie cleared');
    } else {
      console.log('   ⚠️  Session cookie not cleared');
    }

    if (stateCookie) {
      console.log('   ✅ OAuth state cookie cleared');
    } else {
      console.log('   ⚠️  OAuth state cookie not cleared');
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Logout test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test response time (should be fast since no external redirect)
 */
async function testLogoutResponseTime() {
  console.log('\n2. Testing logout response time...');

  try {
    const startTime = Date.now();
    const response = await makeRequest(`${BASE_URL}/api/v1/auth/logout`);
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    console.log(`   ⏱️  Response time: ${responseTime}ms`);

    if (responseTime < 1000) {
      console.log('   ✅ Fast response (< 1 second)');
    } else if (responseTime < 3000) {
      console.log('   ⚠️  Moderate response time');
    } else {
      console.log(
        '   ❌ Slow response (may be redirecting to external service)'
      );
    }

    return responseTime;
  } catch (error) {
    console.log(`   ❌ Response time test failed: ${error.message}`);
    return null;
  }
}

/**
 * Test server availability
 */
async function testServerAvailability() {
  console.log('Checking server availability...');
  try {
    const response = await makeRequest(`${BASE_URL}/login`);
    if (response.statusCode === 200) {
      console.log('✅ Server is running and accessible\n');
      return true;
    } else {
      console.log(`❌ Server returned status ${response.statusCode}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server not accessible: ${error.message}\n`);
    return false;
  }
}

/**
 * Analyze logout behavior
 */
function analyzeLogoutBehavior(responseTime) {
  console.log('\n3. Logout behavior analysis:');

  if (responseTime && responseTime < 500) {
    console.log('   ✅ Immediate response suggests background Cognito call');
    console.log('   ✅ User experience: Fast and seamless');
    console.log('   ✅ Implementation: Correct fire-and-forget pattern');
  } else if (responseTime && responseTime > 2000) {
    console.log('   ⚠️  Slow response suggests blocking external call');
    console.log('   ⚠️  User experience: May feel sluggish');
    console.log('   ⚠️  Implementation: May be waiting for Cognito response');
  } else {
    console.log('   ℹ️  Moderate response time');
  }
}

/**
 * Main test runner
 */
async function runLogoutTests() {
  console.log('Testing logout endpoint behavior...\n');
  console.log(`Target server: ${BASE_URL}`);
  console.log('='.repeat(50));

  // Check server availability first
  const serverAvailable = await testServerAvailability();
  if (!serverAvailable) {
    console.log('Please start the development server: npm run dev');
    process.exit(1);
  }

  // Run logout tests
  const logoutWorked = await testLogoutEndpoint();
  const responseTime = await testLogoutResponseTime();

  if (logoutWorked && responseTime !== null) {
    analyzeLogoutBehavior(responseTime);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Logout behavior test completed!');

  console.log('\n📋 Expected behavior:');
  console.log('• Fast response (< 500ms)');
  console.log('• Redirects to /login (not Cognito)');
  console.log('• Clears session cookies');
  console.log('• Cognito logout happens in background');

  console.log('\n📚 To test complete flow:');
  console.log('1. Login with SSO in browser');
  console.log('2. Click logout');
  console.log('3. Should immediately see login page');
  console.log('4. Check server logs for background Cognito call');
}

// Run if called directly
if (require.main === module) {
  runLogoutTests().catch((error) => {
    console.error('\n❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runLogoutTests };
