### System Architecture
```mermaid
graph TD
    %% Define reusable style classes with explicit padding adjustments (px)
    classDef clientStyle fill:#f8fafc,stroke:#cbd5e1,stroke-width:2px,color:#0f172a,padding:15px;
    classDef storeStyle fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b,padding:20px;
    classDef syncStyle fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#3b0764,padding:15px;
    classDef backendStyle fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#431407,padding:15px;

    subgraph Client [Browser / Client-Side]
        UI[React UI Components]:::clientStyle
        State[Legend-State: state$, globalUser$]:::storeStyle
        Sync[Sync Engine: realtime.ts]:::syncStyle
        DB[(IndexedDB: Offline Store)]:::storeStyle
    end

    subgraph Backend [Supabase]
        Auth[Supabase Auth]:::backendStyle
        Postgres[(PostgreSQL: tasks, categories)]:::backendStyle
        Realtime[Supabase Realtime Channel]:::backendStyle
    end

    %% Apply explicit links with custom arrow colors
    UI <-->|Reads/Writes| State
    State <-->|Persists| DB
    State -->|Triggers onChange| Sync
    Sync -->|Subscribes/Resolves| State

    UI -->|Authenticates| Auth
    Sync -->|UPSERT/DELETE Queue| Postgres
    Realtime -->|postgres_changes| Sync
    Postgres --> Realtime

    %% Change link line colors globally or individually
    linkStyle default stroke:#64748b,stroke-width:2px;
```

---


#### Sync Sequence Example


```mermaid
sequenceDiagram
    participant U as User / UI
    participant L as Legend-State
    participant IDB as IndexedDB (Offline)
    participant S as Sync Engine (realtime.ts)
    participant Supa as Supabase

    U->>L: Create or Edit Task
    L->>IDB: Persist automatically
    L->>S: onChange event triggered
    S->>S: Hash diff against knownTasks
    S->>S: Queue UPSERT/DELETE operation
    S->>S: Debounce 500ms

    alt is Online
        S->>Supa: Execute Supabase API (Upsert/Delete)
        Supa-->>S: Success response
        S->>S: Remove from syncQueue
        S->>L: Update queue state
    else is Offline
        S->>S: Halt processing
        S->>IDB: syncQueue remains persisted
    end

    Note over Supa,S: Remote changes from other devices
    Supa->>S: postgres_changes (INSERT/UPDATE/DELETE)
    S->>S: Check updated_at (Conflict Resolution)
    alt Remote is newer
        S->>S: Lock isApplyingRemoteChange = true
        S->>L: Update state with remote payload
        L->>IDB: Persist synced data
        S->>S: Update knownTasks cache
        S->>S: Unlock isApplyingRemoteChange
    else Local is newer
        S->>S: Discard remote change
    end