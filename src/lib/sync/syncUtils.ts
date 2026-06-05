import { state$, Category, Task } from '@/lib/state/store';
import { supabase } from '@/lib/supabase';

export interface MigrationPayload {
  categories: (Category & { user_id: string })[];
  tasks: (Task & { user_id: string })[];
}

export function buildMigrationPayload(userId: string): MigrationPayload {
  const categories = state$.categories.get() || [];
  const tasks = state$.tasks.get() || [];

  return {
    categories: categories.map(cat => ({ ...cat, user_id: userId })),
    tasks: tasks.map(task => ({ ...task, user_id: userId })),
  };
}

export async function migrateToSupabase(userId: string): Promise<void> {
  const payload = buildMigrationPayload(userId);

  if (payload.categories.length > 0) {
    const { error } = await supabase.from('categories').upsert(payload.categories);
    if (error) {
      console.error('Failed to migrate categories:', error);
      throw error;
    }
  }

  if (payload.tasks.length > 0) {
    const { error } = await supabase.from('tasks').upsert(payload.tasks);
    if (error) {
      console.error('Failed to migrate tasks:', error);
      throw error;
    }
  }
}

