import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskList } from './TaskList';
import { state$ } from '@/lib/state/store';

describe('TaskList', () => {
  beforeEach(() => {
    state$.tasks.set([
      { id: 't1', title: 'Task 1', status: 'pending', category_id: null },
      { id: 't2', title: 'Task 2', status: 'done', category_id: null }
    ]);
  });

  it('renders a list of tasks', () => {
    render(<TaskList />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('toggles task completion status when clicked', () => {
    render(<TaskList />);
    
    // Find the toggle button for Task 1 via its aria-label
    const toggleButtons = screen.getAllByRole('button', { name: /mark as done/i });
    const task1Toggle = toggleButtons[0]; // first pending task
    
    // Toggle to done
    fireEvent.click(task1Toggle);
    
    // Wait for state to update
    const tasks = state$.tasks.get();
    expect(tasks.find(t => t.id === 't1')?.status).toBe('done');
    
    // Toggle back to pending
    const doneButton = screen.getAllByRole('button', { name: /mark as pending/i })[0];
    fireEvent.click(doneButton);
    const updatedTasks = state$.tasks.get();
    expect(updatedTasks.find(t => t.id === 't1')?.status).toBe('pending');
  });
});
