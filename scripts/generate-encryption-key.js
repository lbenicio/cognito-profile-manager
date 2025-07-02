#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate a secure 32-byte encryption key for session encryption.
 * This script generates a base64-encoded key suitable for the
 * TOTP_SECRET_ENCRYPTION_KEY environment variable.
 */

function generateEncryptionKey() {
  // Generate 32 random bytes
  const key = crypto.randomBytes(32);

  // Convert to base64
  const base64Key = key.toString('base64');

  console.log('🔐 Generated Encryption Key for TOTP_SECRET_ENCRYPTION_KEY:');
  console.log('');
  console.log(base64Key);
  console.log('');
  console.log('📋 Add this to your .env file:');
  console.log(`TOTP_SECRET_ENCRYPTION_KEY=${base64Key}`);
  console.log('');
  console.log('⚠️  Keep this key secure and never share it publicly!');
  console.log('💡 Use different keys for development and production environments.');

  return base64Key;
}

// Run if called directly
if (require.main === module) {
  generateEncryptionKey();
}

module.exports = { generateEncryptionKey };
