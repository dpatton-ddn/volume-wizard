import type { StepProps } from '../state';

// Layout only: nothing below is connected to wizard state yet. See README.
export function AccessStep({ state, update, errors }: StepProps) {
  return (
    <>
      <fieldset>
        <legend>Protocol</legend>
        <label className="option">
          <input type="radio" name="protocol" value="nfs" />
          <span>
            <strong>NFS</strong>
            <span className="muted"> — Linux and Unix clients</span>
          </span>
        </label>
        <label className="option">
          <input type="radio" name="protocol" value="smb" />
          <span>
            <strong>SMB</strong>
            <span className="muted"> — Windows clients</span>
          </span>
        </label>
      </fieldset>

      <fieldset>
        <legend>Access rules</legend>
        <ul className="rules">
          <li className="row">
            <input type="text" aria-label="CIDR" placeholder="10.0.0.0/24" />
            <select aria-label="Access">
              <option value="ro">Read-only</option>
              <option value="rw">Read-write</option>
            </select>
            <button type="button">Remove</button>
          </li>
        </ul>
        <button type="button">Add rule</button>
      </fieldset>
    </>
  );
}
