import { supabase } from '@/lib/supabase';
import { state$, Category, Task, SyncOperation } from '@/lib/state/store';
import { generateId } from '@/utils/generateId';

let isApplyingRemoteChange = false;


/**
 * @constant knownTasks In-memory cache for state diffing
 * @constant knownCategories In-memory cache for state diffing
 */
const knownTasks = new Map<string, string>();
const knownCategories = new Map<string, string>();


/**
 * Generates a predictable hash for diffing, deliberately ignoring the 'updated_at'
 * timestamp so our own timestamp mutations don't trigger recursive diffing loops. 
 * @param obj 
 * @returns 
 */
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
export const processQueue = debounce(doProcessQueue, 500);
async function doProcessQueue() {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return;
  }

  const queue = state$.syncQueue.peek() || [];
  if (queue.length === 0) return;

  // Group by RECORD ID to ensure only the latest mutation per item is processed
  const latestOps = new Map<string, SyncOperation>();
  for (const op of queue) {
    latestOps.set(op.record_id, op);

  }

  const opsToProcess = Array.from(latestOps.values());
  const successfulIds = new Set<String>();

  for (const op of opsToProcess) {
    try {
      if (op.action === 'UPSERT') {
        const { error } = await supabase.from(op.table).upsert(op.payload);
        if (!error) {
          successfulIds.add(op.record_id);

        } else {
          console.error(`[Sync] Supabase UPSERT Error for ${op.record_id}:`, error); // <-- Add this
        }
      } else if (op.action === 'DELETE') {
        const { error } = await supabase.from(op.table).delete().eq('id', op.record_id);
        if (!error) {
          successfulIds.add(op.record_id);

          if (op.table === 'categories') {
            console.log(`[Sync] Successfully removed category in Supabase: ${op.record_id}`);
          }

        } else {
          console.error(`[Sync] Supabase DELETE Error for ${op.record_id}:`, error); // <-- Add this
        }
      }
    } catch (err) {
      console.error(`[Sync] Operation error on ${op.record_id}:`, err);
    }
  }

  if (successfulIds.size > 0) {
    isApplyingRemoteChange = true;

  }
  // Remove processed items from queue
  if (successfulIds.size > 0) {
    isApplyingRemoteChange = true;
    try {
      const currentQueue = state$.syncQueue.peek() || [];
      const newQueue = currentQueue.filter(op => !successfulIds.has(op.record_id));
      state$.syncQueue.set(newQueue);
    } finally {
      isApplyingRemoteChange = false;
    }
  }

}

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

  /**
   * Diffing function for outgoing changes (Local -> Remote)
   * 1. Additions and modifications are detected and added to the sync queue.
   * 2. Deletions are detected and added to the sync queue.
   * 3. Deduplicates entries in the sync queue, only keeping the latest.
   * 4. Updates the timestamp of the local state to prevent recursive diffing loops.
   * 5. Extracts the user ID from the current user
   * 6. Builds the correct payload for the sync queue
   * @param table - The table to sync (tasks or categories)
   * @param currentArray - The current array of items in the table
   */
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

          // Deduplicate: Remove existing pending operations for this specific record
          const existingIndex = newQueue.findIndex(q => q.record_id === item.id && q.table === table);
          if (existingIndex >= 0) {
            newQueue.splice(existingIndex, 1);
          }

          newQueue.push({
            id: generateId(), // Unique ID for the queue array
            record_id: item.id,      // The target database ID
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

          const existingIndex = newQueue.findIndex(q => q.record_id === id && q.table === table);
          if (existingIndex >= 0) newQueue.splice(existingIndex, 1);

          newQueue.push({
            id: generateId(),
            record_id: id,
            table,
            action: 'DELETE',
            payload: null
          });
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


export async function fetchInitialData(userId: string) {
  // Tell the sync engine to ignore these changes so it doesn't push them back to Supabase
  isApplyingRemoteChange = true;

  try {
    const [tasksResponse, categoriesResponse] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('categories').select('*').eq('user_id', userId)

    ]);

    if (tasksResponse.error) console.error("Error fetching tasks", tasksResponse.error);
    if (categoriesResponse.error) console.error("Error fetching tasks", categoriesResponse.error);

    // Remote data from Supabase
    const remoteTasks = tasksResponse.data || [];
    const remoteCategories = categoriesResponse.data || [];


    // Merge tasks into Legend-State
    const currentTasks = state$.tasks.peek() || [];
    const taskMap = new Map(currentTasks.map(t => [t.id, t]));

    remoteTasks.forEach(remoteTask => {
      const localTask = taskMap.get(remoteTask.id);
      //Only overwrite if the remote task is newer or it doeesnt exist locally
      if (!localTask || new Date(remoteTask.updated_at) > new Date(localTask.updated_at || 0)) {
        taskMap.set(remoteTask.id, remoteTask);
        knownTasks.set(remoteTask.id, getHash(remoteTask));
      }
    });
    state$.tasks.set(Array.from(taskMap.values()));



    const currentCategories = state$.categories.peek() || [];
    const categoryMap = new Map(currentCategories.map(c => [c.id, c]));


    remoteCategories.forEach(remoteCat => {
      const localCat = categoryMap.get(remoteCat.id);
      if (!localCat || new Date(remoteCat.updated_at) > new Date(localCat.updated_at || 0)) {
        categoryMap.set(remoteCat.id, remoteCat);
        knownCategories.set(remoteCat.id, getHash(remoteCat)); // Update diff cache
      }
    });
    state$.categories.set(Array.from(categoryMap.values()));

  } finally {
    isApplyingRemoteChange = false;
  }
}