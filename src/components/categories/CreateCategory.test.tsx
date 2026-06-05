import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCategory } from './CreateCategory';
import { state$ } from '@/lib/state/store';

describe('CreateCategory', () => {
  beforeEach(() => {
    // Reset state before each test
    state$.categories.set([]);
  });

  it('renders an add category button', () => {
    render(<CreateCategory />);
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('opens a form, allows entering a name, selecting a color, and submitting', async () => {
    render(<CreateCategory />);
    
    // Open the form
    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);
    
    // Find input and submit button
    const input = screen.getByPlaceholderText(/category name/i);
    const submitBtn = screen.getByRole('button', { name: /save/i });
    
    // There should be color options
    const colorOptions = screen.getAllByRole('radio');
    expect(colorOptions.length).toBeGreaterThan(0);
    
    // Simulate user input
    fireEvent.change(input, { target: { value: 'New Category' } });
    fireEvent.click(colorOptions[1]); // select second color
    
    // Submit
    fireEvent.click(submitBtn);
    
    // Assert state update
    const categories = state$.categories.get();
    expect(categories.length).toBe(1);
    expect(categories[0].name).toBe('New Category');
    expect(categories[0].color).toBeDefined();
    expect(categories[0].id).toBeDefined();
    
    // Form should close (save button disappears)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });
});
