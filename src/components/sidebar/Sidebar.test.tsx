import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { state$ } from '@/lib/state/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signOut: vi.fn()
    }
  }
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null } as any);

    state$.categories.set([
      { id: '1', name: 'Work', color: '#000' },
      { id: '2', name: 'Personal', color: '#fff' }
    ]);
  });

  it('renders a list of categories from the state', async () => {
    render(<Sidebar />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders Guest User profile and Sign In / Sign Up button when user is not logged in', async () => {
    render(<Sidebar />);
    
    // Wait for loading to finish and check guest view
    const guestUserText = await screen.findByText('Guest User');
    expect(guestUserText).toBeInTheDocument();
    
    const signInBtn = screen.getByRole('button', { name: /sign in \/ sign up/i });
    expect(signInBtn).toBeInTheDocument();
  });

  it('renders User profile and Sign Out button when user is logged in', async () => {
    // Mock active user session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          }
        }
      },
      error: null
    } as any);

    render(<Sidebar />);
    
    // Wait for loading to finish and check user view
    const userEmailText = await screen.findByText('john.doe@example.com');
    expect(userEmailText).toBeInTheDocument();
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    
    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
  });
});
