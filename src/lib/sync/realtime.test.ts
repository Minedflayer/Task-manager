import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupRealtimeSync } from './realtime';
import { state$ } from '@/lib/state/store';
import { supabase } from '@/lib/supabase';

// Mock Supabase channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn(),
};

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
    },
  };
});

describe('setupRealtimeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state$.categories.set([]);
    state$.tasks.set([]);
  });

  it('subscribes to categories and tasks channels', () => {
    setupRealtimeSync('user-123');

    expect(supabase.channel).toHaveBeenCalledWith('custom-all-channel');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ event: '*', schema: 'public', table: 'categories' }),
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ event: '*', schema: 'public', table: 'tasks' }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });
});
