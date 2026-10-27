import { useCallback, useEffect, useRef, useState } from 'react';
import { getClusters } from '../api/client';
import type { Cluster } from '../api/types';
import { initialState, type Errors, type Update, type WizardState } from './state';
import { AccessStep } from './steps/AccessStep';
import { ClusterStep } from './steps/ClusterStep';
import { ReviewStep } from './steps/ReviewStep';
import { VolumeStep } from './steps/VolumeStep';
import { validateAccess, validateCluster, validateVolume } from './validate';

const STEPS = ['Cluster', 'Volume', 'Access', 'Review'];

type ClustersLoad =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; clusters: Cluster[] };

function validateStep(index: number, state: WizardState, cluster: Cluster | undefined): Errors {
  if (index === 0) return validateCluster(state);
  if (index === 1) return validateVolume(state, cluster);
  if (index === 2) return validateAccess(state);
  return {};
}

export function Wizard() {
  const [state, setState] = useState(initialState);
  // Must stay referentially stable: step effects list it as a dependency.
  const update = useCallback<Update>((patch) => setState((s) => ({ ...s, ...patch })), []);

  const [load, setLoad] = useState<ClustersLoad>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getClusters(controller.signal).then(
      (clusters) => setLoad({ status: 'ready', clusters }),
      (err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoad({ status: 'error' });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  if (load.status === 'loading') return <p>Loading clusters…</p>;
  if (load.status === 'error') {
    return (
      <div role="alert">
        <p>Could not load clusters.</p>
        <button
          type="button"
          onClick={() => {
            setLoad({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { clusters } = load;
  const cluster = clusters.find((c) => c.id === state.clusterId);
  const errors = validateStep(index, state, cluster);
  const visibleErrors = shown[index] === true ? errors : {};
  const isLast = index === STEPS.length - 1;

  function next() {
    if (Object.keys(errors).length > 0) {
      setShown((s) => ({ ...s, [index]: true }));
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <div className="wizard">
      <ol className="stepper">
        {STEPS.map((title, i) => (
          <li key={title} aria-current={i === index ? 'step' : undefined}>
            {title}
          </li>
        ))}
      </ol>
      <h2 ref={headingRef} tabIndex={-1}>
        {STEPS[index]}
      </h2>
      {index === 0 && (
        <ClusterStep state={state} update={update} errors={visibleErrors} clusters={clusters} />
      )}
      {index === 1 && (
        <VolumeStep state={state} update={update} errors={visibleErrors} cluster={cluster} />
      )}
      {index === 2 && <AccessStep state={state} update={update} errors={visibleErrors} />}
      {index === 3 && (
        <ReviewStep state={state} update={update} errors={visibleErrors} cluster={cluster} />
      )}
      <div className="actions">
        {index > 0 && (
          <button type="button" onClick={() => setIndex((i) => i - 1)}>
            Back
          </button>
        )}
        {!isLast && (
          <button type="button" className="primary" onClick={next}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
