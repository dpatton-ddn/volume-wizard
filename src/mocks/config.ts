export interface ApiConfig {
  latency: [number, number];
  fail: 'none' | 'submit' | 'random';
  /** Extra latency when a name already exists (the service does an ownership lookup). */
  nameLookupMs: number;
}

const LATENCY: Record<string, [number, number]> = {
  none: [0, 0],
  fast: [50, 200],
  normal: [200, 1500],
  slow: [1500, 4000],
};

function readConfig(): ApiConfig {
  const config: ApiConfig = { latency: LATENCY.normal, fail: 'none', nameLookupMs: 1000 };
  if (typeof window === 'undefined') return config;
  const params = new URLSearchParams(window.location.search);
  const latency = params.get('latency');
  if (latency && latency in LATENCY) config.latency = LATENCY[latency];
  const fail = params.get('fail');
  if (fail === 'submit' || fail === 'random') config.fail = fail;
  return config;
}

export const apiConfig: ApiConfig = readConfig();

export function setApiConfig(partial: Partial<ApiConfig>): void {
  Object.assign(apiConfig, partial);
}
