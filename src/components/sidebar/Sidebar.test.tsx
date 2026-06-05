import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { state$ } from '@/lib/state/store';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Sidebar', () => {
  beforeEach(() => {
    state$.categories.set([
      { id: '1', name: 'Work', color: '#000' },
      { id: '2', name: 'Personal', color: '#fff' }
    ]);
  });

  it('renders a list of categories from the state', () => {
    render(<Sidebar />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });
});
