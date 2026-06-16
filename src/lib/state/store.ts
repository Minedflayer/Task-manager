import { observable } from '@legendapp/state';
import { persistObservable, configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistIndexedDB } from '@legendapp/state/persist-plugins/indexeddb';

export interface Category {
  id: string;
  name: string;
  color: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'due';
  category_id: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  end_time?: string | null
  description?: string | null;
  updated_at?: string;
}

export interface SyncOperation {
  id: string; // The ID of the item
  record_id: string;
  table: 'tasks' | 'categories';
  action: 'UPSERT' | 'DELETE';
  payload?: any; // The full object for UPSERT
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  syncQueue: SyncOperation[];
}

export const state$ = observable<AppState>({
  tasks: [],
  categories: [],
  syncQueue: []
});

// Configure IndexedDB persistence for offline-first capabilities
if (typeof window !== 'undefined') {
  configureObservablePersistence({
    pluginLocal: ObservablePersistIndexedDB,
    localOptions: {
      indexedDB: {
        databaseName: 'task-manager-db',
        version: 1,
        tableNames: ['task-manager-offline-store'],
      }
    }
  });

  persistObservable(state$, {
    local: 'task-manager-offline-store',
  });
}
