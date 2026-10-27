import type { Cluster } from '../api/types';
import { formatCapacity, toGiB } from './lib';
import type { Errors, WizardState } from './state';

export const NAME_PATTERN = /^[a-z][a-z0-9-]{1,61}[a-z0-9]$/;

export function validateCluster(state: WizardState): Errors {
  return state.clusterId ? {} : { clusterId: 'Select a cluster' };
}

export function validateVolume(state: WizardState, cluster: Cluster | undefined): Errors {
  const errors: Record<string, string> = {};

  if (!state.name) {
    errors.name = 'Name is required';
  } else if (!NAME_PATTERN.test(state.name)) {
    errors.name = 'Use 3–63 lowercase letters, numbers, or hyphens; start with a letter';
  } else if (state.nameCheck?.name !== state.name || state.nameCheck.status === 'checking') {
    errors.name = 'Checking availability…';
  } else if (state.nameCheck.status === 'taken') {
    errors.name = 'That name is already in use';
  } else if (state.nameCheck.status === 'error') {
    errors.name = 'Could not check name availability';
  }

  const value = state.capacityValue.trim() === '' ? NaN : Number(state.capacityValue);
  if (!Number.isFinite(value) || value <= 0) {
    errors.capacity = 'Enter a capacity greater than 0';
  } else if (cluster && toGiB(value, state.capacityUnit) > cluster.freeGiB) {
    errors.capacity = `Exceeds free capacity on ${cluster.name} (${formatCapacity(cluster.freeGiB)} available)`;
  }

  if (!state.tier) {
    errors.tier = 'Select a tier';
  } else if (cluster && !cluster.tiers.includes(state.tier)) {
    errors.tier = 'This tier is not available on the selected cluster';
  }

  return errors;
}

// The candidate implements this.
export function validateAccess(state: WizardState): Errors {
  return {};
}
