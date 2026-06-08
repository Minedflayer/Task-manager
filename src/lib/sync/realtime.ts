import { supabase } from '@/lib/supabase';
import { state$, Category, Task } from '@/lib/state/store';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function setupRealtimeSync(userId: string): RealtimeChannel {
  const channel = supabase.channel(`custom-all-channel-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
      (payload) => {
        const categories = state$.categories.get() || [];
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newCat = payload.new as Category;
          const index = categories.findIndex(c => c.id === newCat.id);
          if (index >= 0) {
            state$.categories[index].set(newCat);
          } else {
            state$.categories.set([...categories, newCat]);
          }
        } else if (payload.eventType === 'DELETE') {
          const oldCat = payload.old as Category;
          state$.categories.set(categories.filter(c => c.id !== oldCat.id));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      (payload) => {
        const tasks = state$.tasks.get() || [];
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newTask = payload.new as Task;
          const index = tasks.findIndex(t => t.id === newTask.id);
          if (index >= 0) {
            state$.tasks[index].set(newTask);
          } else {
            state$.tasks.set([...tasks, newTask]);
          }
        } else if (payload.eventType === 'DELETE') {
          const oldTask = payload.old as Task;
          state$.tasks.set(tasks.filter(t => t.id !== oldTask.id));
        }
      }
    )
    .subscribe();

  return channel;
}
