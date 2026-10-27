import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Wizard } from './Wizard';

describe('Wizard', () => {
  it('blocks Next on step 1 without a selection', async () => {
    const user = userEvent.setup();
    render(<Wizard />);
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    expect(screen.getByText('Select a cluster')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Cluster' })).toBeInTheDocument();
  });

  it('advances with focus on the heading and keeps the selection on Back', async () => {
    const user = userEvent.setup();
    render(<Wizard />);
    await user.click(await screen.findByRole('radio', { name: /Core West/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Volume' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('radio', { name: /Core West/ })).toBeChecked();
  });
});
