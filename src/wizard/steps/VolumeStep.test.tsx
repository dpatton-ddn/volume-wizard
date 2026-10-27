import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Wizard } from '../Wizard';

async function openVolumeStep(clusterName: RegExp) {
  const user = userEvent.setup();
  render(<Wizard />);
  await user.click(await screen.findByRole('radio', { name: clusterName }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  return user;
}

describe('VolumeStep', () => {
  it('shows an error for a taken name', async () => {
    const user = await openVolumeStep(/Core East/);
    await user.type(screen.getByLabelText('Name'), 'scratch');
    // Let the 300 ms debounce and the (zero-latency) mock request settle.
    await act(() => new Promise((resolve) => setTimeout(resolve, 450)));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('That name is already in use')).toBeInTheDocument();
  });

  it('rejects capacity above the free capacity of the cluster', async () => {
    const user = await openVolumeStep(/Edge 01/);
    await user.type(screen.getByLabelText('Capacity'), '3000');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText('Exceeds free capacity on Edge 01 (2,000 GiB available)'),
    ).toBeInTheDocument();
  });
});
