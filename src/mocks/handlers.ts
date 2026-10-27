import { delay, http, HttpResponse } from 'msw';
import { ApiError } from '../api/errors';
import type { CreateVolumeRequest, EstimateRequest } from '../api/types';
import { apiConfig } from './config';
import * as db from './db';

function randomLatency(): number {
  const [min, max] = apiConfig.latency;
  return min + Math.random() * (max - min);
}

/** Simulated latency, then the optional random-failure injection. */
async function preflight(): Promise<Response | null> {
  await delay(randomLatency());
  if (apiConfig.fail === 'random' && Math.random() < 0.15) {
    return errorResponse(new ApiError(503, 'unavailable', 'Service temporarily unavailable'));
  }
  return null;
}

function errorResponse(err: ApiError): Response {
  return HttpResponse.json({ code: err.code, message: err.message }, { status: err.status });
}

/** Runs a db operation, mapping thrown ApiErrors to JSON error responses. */
function respond(fn: () => Response): Response {
  try {
    return fn();
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err);
    throw err;
  }
}

export const handlers = [
  http.get('/api/clusters', async () => {
    return (await preflight()) ?? respond(() => HttpResponse.json(db.listClusters()));
  }),

  http.get('/api/volumes/name-available', async ({ request }) => {
    const failure = await preflight();
    if (failure) return failure;
    const name = new URL(request.url).searchParams.get('name') ?? '';
    const available = db.isNameAvailable(name);
    // The service does an extra ownership lookup when the name exists.
    if (!available) await delay(apiConfig.nameLookupMs);
    return HttpResponse.json({ available });
  }),

  http.post('/api/estimate', async ({ request }) => {
    const failure = await preflight();
    if (failure) return failure;
    const body = (await request.json()) as EstimateRequest;
    return respond(() => HttpResponse.json(db.estimate(body)));
  }),

  http.post('/api/volumes', async ({ request }) => {
    const failure = await preflight();
    if (failure) return failure;
    if (apiConfig.fail === 'submit') {
      return errorResponse(new ApiError(409, 'insufficient_capacity', 'Not enough free capacity on cluster'));
    }
    const body = (await request.json()) as CreateVolumeRequest;
    return respond(() => HttpResponse.json(db.create(body), { status: 201 }));
  }),
];
