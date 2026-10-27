export type Tier = 'performance' | 'capacity' | 'archive';
export type CapacityUnit = 'GiB' | 'TiB';
export interface Cluster { id: string; name: string; region: string; freeGiB: number; tiers: Tier[] }
export interface CreateVolumeRequest {
  clusterId: string; name: string;
  capacity: { value: number; unit: CapacityUnit };
  tier: Tier;
  protocol: 'nfs' | 'smb';
  accessRules: { cidr: string; access: 'ro' | 'rw' }[];
  snapshots: null | { schedule: 'hourly' | 'daily'; retention: number };
}
export interface EstimateRequest { clusterId: string; capacity: { value: number; unit: CapacityUnit }; tier: Tier; snapshotsEnabled: boolean }
export interface Estimate { monthlyCostCents: number }
export interface Volume { id: string; name: string; status: 'provisioning' }
