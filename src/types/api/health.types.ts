export type HealthProbeStatus = 'ok' | 'error';

export interface HealthProbeResult {
  name: string;
  status: HealthProbeStatus;
  details?: string;
  duration?: number;
}
