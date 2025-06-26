import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
if (!accountId) throw new Error('R2_ACCOUNT_ID is not set in .env');

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
if (!accessKeyId) throw new Error('R2_ACCESS_KEY_ID is not set in .env');

const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!secretAccessKey) throw new Error('R2_SECRET_ACCESS_KEY is not set in .env');

const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

export const r2 = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});
