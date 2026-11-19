import { NextResponse } from 'next/server';
import { pingCache } from '@/lib/cache';
import { getWellKnownConfig } from '@/lib/well-known';
import type {
  HealthProbeResult,
  HealthProbeStatus,
} from '@/types/api/health.types';

export async function GET() {
  const checks: HealthProbeResult[] = [];
  let overallStatus: HealthProbeStatus = 'ok';

  // --- Check App Status (always ok if we reach here) ---
  checks.push({ name: 'application', status: 'ok' });

  // --- Check Cache Provider ---
  const cacheStartTime = Date.now();
  try {
    const cacheResult = await pingCache();
    checks.push({
      name: 'cache',
      status: cacheResult.status,
      details: cacheResult.message,
      duration: Date.now() - cacheStartTime,
    });
    if (cacheResult.status === 'error') {
      overallStatus = 'error';
    }
  } catch (error) {
    overallStatus = 'error';
    checks.push({
      name: 'cache',
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown cache error',
      duration: Date.now() - cacheStartTime,
    });
  }

  // --- Check Cognito Connectivity ---
  const cognitoStartTime = Date.now();
  try {
    await getWellKnownConfig();
    checks.push({
      name: 'cognito',
      status: 'ok',
      details: 'Well-known endpoint is accessible.',
      duration: Date.now() - cognitoStartTime,
    });
  } catch (error) {
    overallStatus = 'error';
    checks.push({
      name: 'cognito',
      status: 'error',
      details:
        error instanceof Error
          ? error.message
          : 'Failed to connect to Cognito.',
      duration: Date.now() - cognitoStartTime,
    });
  }

  const responseBody = {
    status: overallStatus === 'ok' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(responseBody, {
    status: overallStatus === 'ok' ? 200 : 503,
  });
}
