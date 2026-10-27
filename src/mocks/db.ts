import { ApiError } from '../api/errors';
import type {
  Cluster,
  CreateVolumeRequest,
  Estimate,
  EstimateRequest,
  Tier,
  Volume,
} from '../api/types';

const initialClusters = (): Cluster[] => [
  { id: 'core-east', name: 'Core East', region: 'us-east-1', freeGiB: 51200, tiers: ['performance', 'capacity', 'archive'] },
  { id: 'core-west', name: 'Core West', region: 'us-west-2', freeGiB: 20480, tiers: ['performance', 'capacity'] },
  { id: 'edge-01', name: 'Edge 01', region: 'eu-central-1', freeGiB: 2000, tiers: ['capacity', 'archive'] },
];

let clusters = initialClusters();
let takenNames = new Set(['scratch', 'home', 'datasets']);

/** Restores the initial in-memory state (used by tests). */
export function resetDb(): void {
  clusters = initialClusters();
  takenNames = new Set(['scratch', 'home', 'datasets']);
}

const CENTS_PER_GIB: Record<Tier, number> = { performance: 20, capacity: 8, archive: 2 };

function toGiBServer(capacity: { value: number; unit: 'GiB' | 'TiB' }): number {
  return capacity.unit === 'TiB' ? capacity.value * 1024 : capacity.value;
}

export function listClusters(): Cluster[] {
  return clusters;
}

export function isNameAvailable(name: string): boolean {
  return !takenNames.has(name);
}

export function estimate(req: EstimateRequest): Estimate {
  const cluster = clusters.find((c) => c.id === req.clusterId);
  if (!cluster) throw new ApiError(404, 'not_found', 'Cluster not found');
  let cents = toGiBServer(req.capacity) * CENTS_PER_GIB[req.tier];
  if (req.snapshotsEnabled) cents *= 1.15;
  if (cluster.region === 'eu-central-1') cents *= 1.1;
  return { monthlyCostCents: Math.round(cents) };
}

export function create(req: CreateVolumeRequest): Volume {
  const cluster = clusters.find((c) => c.id === req.clusterId);
  if (!cluster) throw new ApiError(404, 'not_found', 'Cluster not found');
  if (!cluster.tiers.includes(req.tier)) {
    throw new ApiError(400, 'invalid_tier', 'Tier is not available on this cluster');
  }
  if (req.tier === 'archive' && (req.protocol === 'smb' || req.snapshots !== null)) {
    throw new ApiError(400, 'invalid_request', 'Archive tier does not support SMB or snapshots');
  }
  if (req.accessRules.length === 0) {
    throw new ApiError(400, 'invalid_request', 'At least one access rule is required');
  }
  if (takenNames.has(req.name)) {
    throw new ApiError(409, 'name_taken', 'A volume with that name already exists');
  }
  const gib = toGiBServer(req.capacity);
  if (gib > cluster.freeGiB) {
    throw new ApiError(409, 'insufficient_capacity', 'Not enough free capacity on cluster');
  }
  takenNames.add(req.name);
  cluster.freeGiB -= gib;
  return { id: 'vol-' + Math.random().toString(36).slice(2, 10), name: req.name, status: 'provisioning' };
}
