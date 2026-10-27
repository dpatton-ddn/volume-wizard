import { useEffect } from 'react';
import { checkNameAvailable } from '../../api/client';
import type { CapacityUnit, Cluster, Tier } from '../../api/types';
import type { StepProps } from '../state';
import { NAME_PATTERN } from '../validate';

const NAME_DEBOUNCE_MS = 300;

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  performance: 'NVMe, lowest latency',
  capacity: 'Hybrid, balanced cost',
  archive: 'Lowest cost, no snapshots or SMB',
};

export function VolumeStep({
  state,
  update,
  errors,
  cluster,
}: StepProps & { cluster: Cluster | undefined }) {
  const name = state.name;

  // Debounced availability check whenever the name changes.
  useEffect(() => {
    if (!NAME_PATTERN.test(name)) {
      update({ nameCheck: null });
      return;
    }
    const controller = new AbortController();
    setTimeout(async () => {
      update({ nameCheck: { name, status: 'checking' } });
      try {
        const { available } = await checkNameAvailable(name, controller.signal);
        update({ nameCheck: { name, status: available ? 'available' : 'taken' } });
      } catch {
        if (controller.signal.aborted) return;
        update({ nameCheck: { name, status: 'error' } });
      }
    }, NAME_DEBOUNCE_MS);
  }, [name, update]);

  const nameError = errors.name;
  const nameStatus = !NAME_PATTERN.test(name)
    ? null
    : state.nameCheck?.name !== name || state.nameCheck.status === 'checking'
      ? 'Checking…'
      : state.nameCheck.status === 'available'
        ? 'Name is available'
        : null;
  const capacityError = errors.capacity;
  const tierError = errors.tier;

  return (
    <>
      <div className="field">
        <label htmlFor="volume-name">Name</label>
        <input
          id="volume-name"
          type="text"
          value={state.name}
          autoComplete="off"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? 'name-error' : undefined}
          onChange={(e) => update({ name: e.target.value })}
        />
        <p className="muted status" aria-live="polite">
          {nameError ? null : nameStatus}
        </p>
        {nameError && (
          <p id="name-error" className="error">
            {nameError}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="volume-capacity">Capacity</label>
        <div className="row">
          <input
            id="volume-capacity"
            type="number"
            min="0"
            value={state.capacityValue}
            aria-invalid={capacityError ? true : undefined}
            aria-describedby={capacityError ? 'capacity-error' : undefined}
            onChange={(e) => update({ capacityValue: e.target.value })}
          />
          <select
            aria-label="Capacity unit"
            value={state.capacityUnit}
            onChange={(e) => update({ capacityUnit: e.target.value as CapacityUnit })}
          >
            <option value="GiB">GiB</option>
            <option value="TiB">TiB</option>
          </select>
        </div>
        {capacityError && (
          <p id="capacity-error" className="error">
            {capacityError}
          </p>
        )}
      </div>

      <fieldset
        aria-invalid={tierError ? true : undefined}
        aria-describedby={tierError ? 'tier-error' : undefined}
      >
        <legend>Tier</legend>
        {(cluster?.tiers ?? []).map((tier) => (
          <label key={tier} className="option">
            <input
              type="radio"
              name="tier"
              value={tier}
              checked={state.tier === tier}
              onChange={() => update({ tier })}
            />
            <span>
              <strong>{tier}</strong>
              <span className="muted"> — {TIER_DESCRIPTIONS[tier]}</span>
            </span>
          </label>
        ))}
        {tierError && (
          <p id="tier-error" className="error">
            {tierError}
          </p>
        )}
      </fieldset>
    </>
  );
}
