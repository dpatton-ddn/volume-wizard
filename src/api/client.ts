import { ApiError } from './errors';
import type {
  Cluster,
  CreateVolumeRequest,
  Estimate,
  EstimateRequest,
  Volume,
} from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const { code, message } = (await res.json()) as { code: string; message: string };
    throw new ApiError(res.status, code, message);
  }
  return (await res.json()) as T;
}

function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

export function getClusters(signal?: AbortSignal): Promise<Cluster[]> {
  return request('/api/clusters', { signal });
}

export function checkNameAvailable(name: string, signal?: AbortSignal): Promise<{ available: boolean }> {
  return request(`/api/volumes/name-available?name=${encodeURIComponent(name)}`, { signal });
}

export function getEstimate(req: EstimateRequest, signal?: AbortSignal): Promise<Estimate> {
  return post('/api/estimate', req, signal);
}

export function createVolume(req: CreateVolumeRequest, signal?: AbortSignal): Promise<Volume> {
  return post('/api/volumes', req, signal);
}
