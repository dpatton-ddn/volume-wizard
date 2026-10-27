import type { CapacityUnit, Tier } from '../api/types';

export type NameCheck = { name: string; status: 'checking' | 'available' | 'taken' | 'error' } | null;

// Add your own fields here; `update({ ... })` accepts any subset.
export interface WizardState {
  clusterId: string | null;
  name: string;
  nameCheck: NameCheck;
  capacityValue: string; // raw input text
  capacityUnit: CapacityUnit;
  tier: Tier | null;
}

export const initialState: WizardState = {
  clusterId: null,
  name: '',
  nameCheck: null,
  capacityValue: '',
  capacityUnit: 'GiB',
  tier: null,
};

export type Update = (patch: Partial<WizardState>) => void;
export type Errors = Partial<Record<string, string>>;

export interface StepProps {
  state: WizardState;
  update: Update;
  errors: Errors;
}
