import { observable } from '@legendapp/state';
import { persistObservable, configureObservablePersistence } from '@legendapp/state/persist';
import { ObservablePersistIndexedDB } from '@legendapp/state/persist-plugins/indexeddb';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'due';
  category_id: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
}

export const state$ = observable<AppState>({
  tasks: [],
  categories: []
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
