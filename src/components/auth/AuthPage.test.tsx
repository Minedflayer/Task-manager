import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthPage } from './AuthPage';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

describe('AuthPage', () => {
  const mockOnGuest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields, and a sign-in button', () => {
    render(<AuthPage onGuest={mockOnGuest} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a toggle to switch between sign in and sign up', () => {
    render(<AuthPage onGuest={mockOnGuest} />);

    const toggleLink = screen.getByRole('button', { name: /sign up/i });
    expect(toggleLink).toBeInTheDocument();

    fireEvent.click(toggleLink);

    // After toggling, the submit button should say "Create Account" or "Sign Up"
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders a "Try as Guest" button that calls onGuest when clicked', () => {
    render(<AuthPage onGuest={mockOnGuest} />);

    const guestBtn = screen.getByRole('button', { name: /try as guest/i });
    expect(guestBtn).toBeInTheDocument();

    fireEvent.click(guestBtn);
    expect(mockOnGuest).toHaveBeenCalledTimes(1);
  });
});
