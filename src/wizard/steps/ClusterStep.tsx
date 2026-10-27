import type { Cluster } from '../../api/types';
import { formatFree } from '../lib';
import type { StepProps } from '../state';

export function ClusterStep({
  state,
  update,
  errors,
  clusters,
}: StepProps & { clusters: Cluster[] }) {
  const error = errors.clusterId;
  const errorId = 'cluster-error';

  return (
    <fieldset aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}>
      <legend>Cluster</legend>
      {clusters.map((cluster) => (
        <label key={cluster.id} className="option">
          <input
            type="radio"
            name="cluster"
            value={cluster.id}
            checked={state.clusterId === cluster.id}
            // Intentionally only sets clusterId; other fields are left alone.
            onChange={() => update({ clusterId: cluster.id })}
          />
          <span>
            <strong>{cluster.name}</strong> · {cluster.region}
            <span className="muted"> — {formatFree(cluster.freeGiB)}</span>
          </span>
        </label>
      ))}
      {error && (
        <p id={errorId} className="error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
