import { supabase } from '@/lib/supabase';
import { state$, Category, Task, SyncOperation } from '@/lib/state/store';

let isApplyingRemoteChange = false;

// 1. In-memory cache for state diffing
const knownTasks = new Map<string, string>();
const knownCategories = new Map<string, string>();

// Generates a predictable hash for diffing, deliberately ignoring the 'updated_at' 
// timestamp so our own timestamp mutations don't trigger recursive diffing loops.
function getHash(obj: any) {
  const copy = { ...obj };
  delete copy.updated_at;
  return JSON.stringify(copy);
}

// Pre-fill caches on initialization
(state$.tasks.peek() || []).forEach(t => knownTasks.set(t.id, getHash(t)));
(state$.categories.peek() || []).forEach(c => knownCategories.set(c.id, getHash(c)));

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Processes the outgoing sync queue.
 * - Ensures the client is online before attempting execution.
 * - Groups operations by item ID to guarantee only the latest mutation per record is run.
 * - Executes Supabase operations (UPSERT/DELETE) in sequence.
 * - Safely drains successfully applied operations from the queue while handling remote/local synchronization flags.
 */
async function doProcessQueue() {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    console.log('[Sync] Offline. Keeping items in queue.');
    return;
  }

  const queue = state$.syncQueue.peek() || [];
  if (queue.length === 0) return;

  console.log(`[Sync] Processing queue with ${queue.length} items...`);

  // Group by ID to ensure only the latest mutation per item is processed
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
        if (!error) {
          successfulIds.add(op.id);
          console.log(`[Sync] Upserted ${op.table}: ${op.id}`);
        } else {
          console.error(`[Sync] Failed to upsert ${op.table}:`, error);
        }
      } else if (op.action === 'DELETE') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.id);
        if (!error) {
          successfulIds.add(op.id);
          console.log(`[Sync] Deleted from ${op.table}: ${op.id}`);
        } else {
          console.error(`[Sync] Failed to delete from ${op.table}:`, error);
        }
      }
    } catch (err) {
      console.error(`[Sync] Operation error on ${op.id}:`, err);
    }
  }

  if (successfulIds.size > 0) {
    isApplyingRemoteChange = true;
    try {
      const currentQueue = state$.syncQueue.peek() || [];
      const newQueue = currentQueue.filter(op => !successfulIds.has(op.id));
      state$.syncQueue.set(newQueue);
    } finally {
      isApplyingRemoteChange = false;
    }
  }
}

export const processQueue = debounce(doProcessQueue, 500);

/**
 * Initializes two-way real-time synchronization between the local store and Supabase.
 * 
 * 1. Incoming (Remote -> Local): Subscribes to Supabase `postgres_changes` for tasks and categories.
 *    Applies remote changes to local state, resolving conflicts using the `updated_at` timestamp.
 * 2. Outgoing (Local -> Remote): Listens to local state mutations. Diffs changes against a hash cache 
 *    to detect additions, updates, or deletions, and queues them for remote processing.
 * 3. Connection Management: Listens for window 'online' events to flush the offline queue, and provides
 *    a cleanup function for teardown.
 * 
 * @param userId - The ID of the current user, used to filter database subscriptions.
 * @returns A cleanup function to unsubscribe from channels and local state listeners.
 */
export function setupRealtimeSync(userId: string): () => void {
  const channel = supabase.channel(`custom-all-channel-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
      (payload) => {
        isApplyingRemoteChange = true;
        try {
          const categories = state$.categories.peek() || [];
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newCat = payload.new as Category;
            const index = categories.findIndex(c => c.id === newCat.id);

            if (index >= 0) {
              const localCat = categories[index];
              if (localCat.updated_at && newCat.updated_at && new Date(localCat.updated_at) > new Date(newCat.updated_at)) {
                return;
              }
              state$.categories[index].set(newCat);
            } else {
              state$.categories.set([...categories, newCat]);
            }
            // Update cache to prevent bouncing the remote change back
            knownCategories.set(newCat.id, getHash(newCat));
          } else if (payload.eventType === 'DELETE') {
            const oldCat = payload.old as Category;
            state$.categories.set(categories.filter(c => c.id !== oldCat.id));
            knownCategories.delete(oldCat.id);
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
          const tasks = state$.tasks.peek() || [];
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newTask = payload.new as Task;
            const index = tasks.findIndex(t => t.id === newTask.id);

            if (index >= 0) {
              const localTask = tasks[index];
              if (localTask.updated_at && newTask.updated_at && new Date(localTask.updated_at) > new Date(newTask.updated_at)) {
                return;
              }
              state$.tasks[index].set(newTask);
            } else {
              state$.tasks.set([...tasks, newTask]);
            }
            knownTasks.set(newTask.id, getHash(newTask));
          } else if (payload.eventType === 'DELETE') {
            const oldTask = payload.old as Task;
            state$.tasks.set(tasks.filter(t => t.id !== oldTask.id));
            knownTasks.delete(oldTask.id);
          }
        } finally {
          isApplyingRemoteChange = false;
        }
      }
    )
    .subscribe();

  // 2. Diffing function for outgoing changes
  const handleOutgoingChange = (table: 'tasks' | 'categories', currentArray: any[]) => {
    if (isApplyingRemoteChange) return;

    isApplyingRemoteChange = true;
    try {
      const cache = table === 'tasks' ? knownTasks : knownCategories;
      const targetState = table === 'tasks' ? state$.tasks : state$.categories;
      const currentQueue = state$.syncQueue.peek() || [];
      const newQueue = [...currentQueue];
      let queueChanged = false;
      const now = new Date().toISOString();
      const currentIds = new Set<string>();

      // Detect additions and modifications
      currentArray.forEach((item, index) => {
        if (!item || !item.id) return;
        currentIds.add(item.id);
        const hash = getHash(item);

        if (cache.get(item.id) !== hash) {
          cache.set(item.id, hash);
          targetState[index].updated_at.set(now);

          newQueue.push({
            id: item.id,
            table,
            action: 'UPSERT',
            payload: { ...item, user_id: userId, updated_at: now }
          });
          queueChanged = true;
        }
      });

      // Detect deletions
      for (const id of cache.keys()) {
        if (!currentIds.has(id)) {
          cache.delete(id);
          newQueue.push({ id, table, action: 'DELETE', payload: null });
          queueChanged = true;
        }
      }

      if (queueChanged) {
        state$.syncQueue.set(newQueue);
        processQueue();
      }
    } catch (err) {
      console.error(`[Sync] Processing error for ${table}:`, err);
    } finally {
      isApplyingRemoteChange = false;
    }
  };

  // Safely extract the 'value' regardless of Legend-State object wrapping
  const disposeTasks = state$.tasks.onChange(({ value }) => handleOutgoingChange('tasks', value || []));
  const disposeCategories = state$.categories.onChange(({ value }) => handleOutgoingChange('categories', value || []));

  const onOnline = () => processQueue();
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
  }

  return () => {
    supabase.removeChannel(channel);
    disposeTasks();
    disposeCategories();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', onOnline);
    }
  };
}