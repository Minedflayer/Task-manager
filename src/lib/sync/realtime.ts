import { supabase } from '@/lib/supabase';
import { state$, Category, Task, SyncOperation } from '@/lib/state/store';
import type { RealtimeChannel } from '@supabase/supabase-js';

let isApplyingRemoteChange = false;

// Simple debounce utility for queue processing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

async function doProcessQueue() {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return; // Abort if offline, keep items in queue
  }

  const queue = state$.syncQueue.get() || [];
  if (queue.length === 0) return;

  // Group by ID, keeping only the latest operation
  const latestOps = new Map<string, SyncOperation>();
  for (const op of queue) {
    latestOps.set(op.id, op);
  }

  const opsToProcess = Array.from(latestOps.values());
  const successfulIds = new Set<string>();

  for (const op of opsToProcess) {
    try {
      if (op.action === 'UPSERT') {
        const { error } = await supabase.from(op.table).upsert(op.payload);
        if (!error) successfulIds.add(op.id);
        else console.error(`Failed to upsert ${op.table}:`, error);
      } else if (op.action === 'DELETE') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id);
        if (!error) successfulIds.add(op.id);
      }
    } catch (err) {
      console.error('Failed to sync operation', op, err);
    }
  }

  // Remove processed items from queue
  if (successfulIds.size > 0) {
    isApplyingRemoteChange = true;
    try {
      const currentQueue = state$.syncQueue.get() || [];
      const newQueue = currentQueue.filter(op => !successfulIds.has(op.id));
      state$.syncQueue.set(newQueue);
    } finally {
      isApplyingRemoteChange = false;
    }
  }
}

export const processQueue = debounce(doProcessQueue, 500);

export function setupRealtimeSync(userId: string): () => void {
  const channel = supabase.channel(`custom-all-channel-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
      (payload) => {
        isApplyingRemoteChange = true;
        try {
          const categories = state$.categories.get() || [];
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newCat = payload.new as Category;
            const index = categories.findIndex(c => c.id === newCat.id);
            if (index >= 0) {
              const localCat = categories[index];
              if (localCat.updated_at && newCat.updated_at && new Date(localCat.updated_at) > new Date(newCat.updated_at)) {
                return; // Local is newer, ignore remote
              }
              state$.categories[index].set(newCat);
            } else {
              state$.categories.set([...categories, newCat]);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldCat = payload.old as Category;
            state$.categories.set(categories.filter(c => c.id !== oldCat.id));
          }
        } finally {
          isApplyingRemoteChange = false;
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      (payload) => {
        isApplyingRemoteChange = true;
        try {
          const tasks = state$.tasks.get() || [];
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newTask = payload.new as Task;
            const index = tasks.findIndex(t => t.id === newTask.id);
            if (index >= 0) {
              const localTask = tasks[index];
              if (localTask.updated_at && newTask.updated_at && new Date(localTask.updated_at) > new Date(newTask.updated_at)) {
                return; // Local is newer, ignore remote
              }
              state$.tasks[index].set(newTask);
            } else {
              state$.tasks.set([...tasks, newTask]);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldTask = payload.old as Task;
            state$.tasks.set(tasks.filter(t => t.id !== oldTask.id));
          }
        } finally {
          isApplyingRemoteChange = false;
        }
      }
    )
    .subscribe();

  // Outgoing Listeners
  const disposeTasks = state$.tasks.onChange(({ changes }) => {
    if (isApplyingRemoteChange) return;
    
    isApplyingRemoteChange = true;
    try {
      const newQueue = state$.syncQueue.get() ? [...state$.syncQueue.get()] : [];
      let queueChanged = false;

      // Extract unique indices from changes to avoid duplicate processing in the same event
      const updatedIndices = new Set<number>();
      for (const change of changes) {
        const indexStr = change.path[0];
        if (indexStr !== undefined && !isNaN(Number(indexStr))) {
           updatedIndices.add(Number(indexStr));
        }
      }

      updatedIndices.forEach(index => {
        const task = state$.tasks[index];
        if (!task || !task.id) return;
        
        const now = new Date().toISOString();
        task.updated_at.set(now);
        
        const taskVal = task.get();
        newQueue.push({
          id: taskVal.id,
          table: 'tasks',
          action: 'UPSERT',
          payload: { ...taskVal, user_id: userId, updated_at: now }
        });
        queueChanged = true;
      });

      if (queueChanged) {
        state$.syncQueue.set(newQueue);
        processQueue();
      }
    } finally {
      isApplyingRemoteChange = false;
    }
  });

  const disposeCategories = state$.categories.onChange(({ changes }) => {
    if (isApplyingRemoteChange) return;
    
    isApplyingRemoteChange = true;
    try {
      const newQueue = state$.syncQueue.get() ? [...state$.syncQueue.get()] : [];
      let queueChanged = false;

      const updatedIndices = new Set<number>();
      for (const change of changes) {
        const indexStr = change.path[0];
        if (indexStr !== undefined && !isNaN(Number(indexStr))) {
           updatedIndices.add(Number(indexStr));
        }
      }

      updatedIndices.forEach(index => {
        const cat = state$.categories[index];
        if (!cat || !cat.id) return;
        
        const now = new Date().toISOString();
        cat.updated_at.set(now);
        
        const catVal = cat.get();
        newQueue.push({
          id: catVal.id,
          table: 'categories',
          action: 'UPSERT',
          payload: { ...catVal, user_id: userId, updated_at: now }
        });
        queueChanged = true;
      });

      if (queueChanged) {
        state$.syncQueue.set(newQueue);
        processQueue();
      }
    } finally {
      isApplyingRemoteChange = false;
    }
  });

  // Attach online listener to process queue when network recovers
  const onOnline = () => processQueue();
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
  }

  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel);
    disposeTasks();
    disposeCategories();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline);
    }
  };
}
