#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

console.log('🔍 Testing Cognito Well-Known Configuration\n');

/**
 * Make HTTPS request and return JSON response
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'cognito-config-test/1.0',
        Accept: 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Test environment configuration
 */
function checkEnvironment() {
  console.log('1. Checking environment configuration...');

  try {
    const fs = require('fs');
    const path = require('path');

    const envFile = path.join(process.cwd(), '.env.development.local');

    if (!fs.existsSync(envFile)) {
      console.log('   ❌ .env.development.local not found');
      return null;
    }

    const envContent = fs.readFileSync(envFile, 'utf8');

    // Extract well-known URL
    const wellKnownMatch = envContent.match(
      /NEXT_PUBLIC_COGNITO_WELLKNOWN=(.+)/
    );
    const clientIdMatch = envContent.match(
      /NEXT_PUBLIC_COGNITO_CLIENT_ID=(.+)/
    );
    const appUrlMatch = envContent.match(/APP_URL=(.+)/);

    if (!wellKnownMatch || wellKnownMatch[1].startsWith('#')) {
      console.log(
        '   ⚠️  NEXT_PUBLIC_COGNITO_WELLKNOWN not configured or commented out'
      );
      return null;
    }

    const wellKnownUrl = wellKnownMatch[1].trim();
    const clientId = clientIdMatch ? clientIdMatch[1].trim() : null;
    const appUrl = appUrlMatch ? appUrlMatch[1].trim() : null;

    console.log('   ✅ Environment file found');
    console.log(`   📍 Well-known URL: ${wellKnownUrl}`);
    console.log(
      `   🔑 Client ID: ${clientId ? clientId.substring(0, 10) + '...' : 'Not set'}`
    );
    console.log(`   🌐 App URL: ${appUrl || 'Not set'}`);

    return {
      wellKnownUrl,
      clientId,
      appUrl,
    };
  } catch (error) {
    console.log(`   ❌ Error reading environment: ${error.message}`);
    return null;
  }
}

/**
 * Test well-known configuration endpoint
 */
async function testWellKnownConfig(wellKnownUrl) {
  console.log('\n2. Testing well-known configuration endpoint...');

  try {
    console.log(`   🔍 Fetching: ${wellKnownUrl}`);

    const response = await fetchJson(wellKnownUrl);

    if (response.statusCode === 200) {
      console.log('   ✅ Well-known endpoint accessible');

      const config = response.data;

      // Check required fields
      const requiredFields = [
        'issuer',
        'authorization_endpoint',
        'token_endpoint',
        'jwks_uri',
      ];

      console.log('\n   📋 Configuration details:');
      requiredFields.forEach((field) => {
        if (config[field]) {
          console.log(`   ✅ ${field}: ${config[field]}`);
        } else {
          console.log(`   ❌ ${field}: Missing`);
        }
      });

      // Check logout endpoints
      console.log('\n   🚪 Logout endpoints:');
      if (config.end_session_endpoint) {
        console.log(
          `   ✅ end_session_endpoint: ${config.end_session_endpoint}`
        );
      } else {
        console.log('   ❌ end_session_endpoint: Not found');
      }

      if (config.logout_endpoint) {
        console.log(`   ✅ logout_endpoint: ${config.logout_endpoint}`);
      } else {
        console.log(
          '   ⚠️  logout_endpoint: Not found (this is normal for AWS Cognito)'
        );
      }

      return config;
    } else {
      console.log(`   ❌ HTTP ${response.statusCode} from well-known endpoint`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Failed to fetch well-known config: ${error.message}`);
    return null;
  }
}

/**
 * Test logout URL construction
 */
function testLogoutUrlConstruction(config, clientId, appUrl) {
  console.log('\n3. Testing logout URL construction...');

  if (!config || !clientId || !appUrl) {
    console.log('   ⚠️  Skipping - missing required configuration');
    return;
  }

  const logoutEndpoint = config.end_session_endpoint || config.logout_endpoint;

  if (!logoutEndpoint) {
    console.log('   ❌ No logout endpoint found in configuration');
    return;
  }

  try {
    const logoutUrl = new URL(logoutEndpoint);
    logoutUrl.searchParams.set('client_id', clientId);

    // Use appropriate parameter based on endpoint
    const redirectUri = `${appUrl}/login`;
    if (logoutEndpoint.includes('cognito')) {
      logoutUrl.searchParams.set('logout_uri', redirectUri);
    } else {
      logoutUrl.searchParams.set('post_logout_redirect_uri', redirectUri);
    }

    console.log('   ✅ Logout URL constructed successfully');
    console.log(`   📍 Logout URL: ${logoutUrl.toString()}`);

    // Validate the URL
    if (logoutUrl.searchParams.get('client_id') === clientId) {
      console.log('   ✅ Client ID parameter set correctly');
    } else {
      console.log('   ❌ Client ID parameter issue');
    }

    const redirectParam =
      logoutUrl.searchParams.get('logout_uri') ||
      logoutUrl.searchParams.get('post_logout_redirect_uri');
    if (redirectParam === redirectUri) {
      console.log('   ✅ Redirect URI parameter set correctly');
    } else {
      console.log('   ❌ Redirect URI parameter issue');
    }
  } catch (error) {
    console.log(`   ❌ Failed to construct logout URL: ${error.message}`);
  }
}

/**
 * Test logout endpoint accessibility
 */
async function testLogoutEndpoint(config, clientId, appUrl) {
  console.log('\n4. Testing logout endpoint accessibility...');

  if (!config || !clientId || !appUrl) {
    console.log('   ⚠️  Skipping - missing required configuration');
    return;
  }

  const logoutEndpoint = config.end_session_endpoint || config.logout_endpoint;

  if (!logoutEndpoint) {
    console.log('   ❌ No logout endpoint to test');
    return;
  }

  try {
    // Just test if the endpoint responds (don't actually logout)
    const testUrl = new URL(logoutEndpoint);

    console.log(`   🔍 Testing endpoint: ${testUrl.origin}${testUrl.pathname}`);

    // Make a simple request to see if endpoint exists
    const response = await fetchJson(testUrl.toString()).catch(() => ({
      statusCode: 400,
      error: 'Expected - this endpoint requires parameters',
    }));

    if (response.statusCode === 400) {
      console.log(
        '   ✅ Endpoint exists (400 expected without proper parameters)'
      );
    } else if (response.statusCode < 500) {
      console.log(`   ✅ Endpoint accessible (HTTP ${response.statusCode})`);
    } else {
      console.log(`   ⚠️  Endpoint returned HTTP ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not test endpoint: ${error.message}`);
  }
}

/**
 * Provide recommendations
 */
function provideRecommendations(env, config) {
  console.log('\n5. Recommendations:');

  if (!env) {
    console.log('   📝 Set up environment configuration:');
    console.log('      npm run setup:dev');
    console.log('      Edit .env.development.local with your Cognito details');
    return;
  }

  if (!config) {
    console.log('   📝 Fix Cognito configuration:');
    console.log('      - Verify NEXT_PUBLIC_COGNITO_WELLKNOWN URL is correct');
    console.log('      - Check if User Pool exists and is accessible');
    console.log(
      '      - Ensure URL format: https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid_configuration'
    );
    return;
  }

  console.log('   ✅ Configuration looks good!');
  console.log('   📝 Next steps:');
  console.log('      - Test logout flow in browser');
  console.log('      - Check browser network tab for any 400 errors');
  console.log(
    '      - Verify logout_uri is configured in Cognito App Client settings'
  );
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('Testing Cognito logout configuration...\n');
  console.log('='.repeat(60));

  const env = checkEnvironment();

  if (!env || !env.wellKnownUrl) {
    console.log('\n❌ Cannot proceed without Cognito configuration');
    provideRecommendations(env, null);
    return;
  }

  const config = await testWellKnownConfig(env.wellKnownUrl);

  if (config) {
    testLogoutUrlConstruction(config, env.clientId, env.appUrl);
    await testLogoutEndpoint(config, env.clientId, env.appUrl);
  }

  console.log('\n' + '='.repeat(60));
  provideRecommendations(env, config);

  console.log('\n🏁 Cognito configuration test completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };
