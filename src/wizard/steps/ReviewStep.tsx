import type { Cluster } from '../../api/types';
import type { StepProps } from '../state';

export function ReviewStep({ state }: StepProps & { cluster: Cluster | undefined }) {
  return (
    <>
      <p>Not implemented yet — see README.</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
}
