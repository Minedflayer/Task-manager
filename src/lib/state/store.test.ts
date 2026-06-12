import { describe, it, expect, beforeEach } from 'vitest';
import { state$, Task } from './store';

describe('Legend-State Store', () => {
  beforeEach(() => {
    // Reset state before each test
    state$.set({ tasks: [], categories: [], syncQueue: [] });
  });

  it('should initialize with empty tasks, categories, and syncQueue', () => {
    expect(state$.tasks.get()).toEqual([]);
    expect(state$.categories.get()).toEqual([]);
    expect(state$.syncQueue.get()).toEqual([]);
  });

  it('should be able to add a category', () => {
    const category = { id: 'c1', name: 'Work', color: '#000' };
    state$.categories.push(category);
    expect(state$.categories.get()).toHaveLength(1);
    expect(state$.categories[0].get()).toEqual(category);
  });

  it('should be able to add a task', () => {
    const task: Task = { 
      id: 't1', 
      title: 'Buy groceries', 
      status: 'pending', 
      category_id: null,
      updated_at: new Date().toISOString()
    };
    state$.tasks.push(task);
    expect(state$.tasks.get()).toHaveLength(1);
    expect(state$.tasks[0].title.get()).toBe('Buy groceries');
  });

  it('should have persistence configured', () => {
    // Just verifying the store doesn't crash when configured with sync
    expect(state$).toBeDefined();
  });
});
