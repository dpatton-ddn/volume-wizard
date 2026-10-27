import { describe, expect, it } from 'vitest';
import { createVolume, getEstimate } from './client';

describe('client', () => {
  it('rejects createVolume with name_taken for an existing name', async () => {
    await expect(
      createVolume({
        clusterId: 'core-east',
        name: 'home',
        capacity: { value: 10, unit: 'GiB' },
        tier: 'capacity',
        protocol: 'nfs',
        accessRules: [{ cidr: '10.0.0.0/8', access: 'rw' }],
        snapshots: null,
      }),
    ).rejects.toMatchObject({ code: 'name_taken' });
  });

  it('estimates 100 GiB capacity tier on core-west at 800 cents', async () => {
    const estimate = await getEstimate({
      clusterId: 'core-west',
      capacity: { value: 100, unit: 'GiB' },
      tier: 'capacity',
      snapshotsEnabled: false,
    });
    expect(estimate.monthlyCostCents).toBe(800);
  });
});
