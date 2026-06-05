import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTask } from './CreateTask';
import { state$ } from '@/lib/state/store';

describe('CreateTask', () => {
  beforeEach(() => {
    // Reset state before each test
    state$.tasks.set([]);
    state$.categories.set([
      { id: 'cat-1', name: 'Work', color: '#ffb3ba' },
      { id: 'cat-2', name: 'Personal', color: '#bae1ff' }
    ]);
  });

  it('renders a task input and allows submitting a basic task', async () => {
    render(<CreateTask />);
    
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const submitBtn = screen.getByRole('button', { name: /add task/i });
    
    // Initial state: submit should be disabled if empty
    expect(submitBtn).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);
    
    // Assert state update
    const tasks = state$.tasks.get();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Buy groceries');
    expect(tasks[0].status).toBe('pending');
    expect(tasks[0].id).toBeDefined();
    
    // Form should reset
    expect(input).toHaveValue('');
  });

  it('allows selecting a category for the task', async () => {
    render(<CreateTask />);
    
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    fireEvent.change(input, { target: { value: 'Code review' } });
    
    // Select category
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(categorySelect, { target: { value: 'cat-1' } });
    
    const submitBtn = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(submitBtn);
    
    const tasks = state$.tasks.get();
    expect(tasks[0].category_id).toBe('cat-1');
  });
  
  it('allows setting an optional date and time', async () => {
    render(<CreateTask />);
    
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    fireEvent.change(input, { target: { value: 'Dentist' } });
    
    const dateInput = screen.getByLabelText(/date/i);
    const timeInput = screen.getByLabelText(/time/i);
    
    fireEvent.change(dateInput, { target: { value: '2026-06-10' } });
    fireEvent.change(timeInput, { target: { value: '14:30' } });
    
    const submitBtn = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(submitBtn);
    
    const tasks = state$.tasks.get();
    expect(tasks[0].scheduled_date).toBe('2026-06-10');
    expect(tasks[0].scheduled_time).toBe('14:30');
  });
});
