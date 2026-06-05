import { describe, it, expect, beforeEach } from 'vitest';
import { scheduleTask } from './dndUtils';
import { state$ } from '@/lib/state/store';

describe('scheduleTask', () => {
  beforeEach(() => {
    state$.tasks.set([
      { id: 'task-1', title: 'Buy groceries', status: 'pending', category_id: null, scheduled_date: null, scheduled_time: null },
      { id: 'task-2', title: 'Team meeting', status: 'pending', category_id: null, scheduled_date: '2026-06-08', scheduled_time: '10:00' },
    ]);
  });

  it('sets scheduled_date and scheduled_time when a task is dropped on a slot', () => {
    scheduleTask('task-1', '2026-06-10', '14:00');
    
    const task = state$.tasks.get().find(t => t.id === 'task-1');
    expect(task?.scheduled_date).toBe('2026-06-10');
    expect(task?.scheduled_time).toBe('14:00');
  });

  it('updates an already-scheduled task to a new slot', () => {
    scheduleTask('task-2', '2026-06-09', '15:00');
    
    const task = state$.tasks.get().find(t => t.id === 'task-2');
    expect(task?.scheduled_date).toBe('2026-06-09');
    expect(task?.scheduled_time).toBe('15:00');
  });

  it('does nothing when taskId does not exist', () => {
    const tasksBefore = state$.tasks.get().length;
    scheduleTask('nonexistent-id', '2026-06-10', '09:00');
    expect(state$.tasks.get().length).toBe(tasksBefore);
  });
});
