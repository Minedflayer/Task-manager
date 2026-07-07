```mermaid
graph TD
    subgraph Client [Browser / Client-Side]
        UI[React UI Components]
        State[Legend-State: state$, globalUser$]
        Sync[Sync Engine: realtime.ts]
        DB[(IndexedDB: Offline Store)]
    end

    subgraph Backend [Supabase]
        Auth[Supabase Auth]
        Postgres[(PostgreSQL: tasks, categories)]
        Realtime[Supabase Realtime Channel]
    end

    UI <-->|Reads/Writes| State
    State <-->|Persists| DB
    State -->|Triggers onChange| Sync
    Sync -->|Subscribes/Resolves| State

    UI -->|Authenticates| Auth
    Sync -->|UPSERT/DELETE Queue| Postgres
    Realtime -->|postgres_changes| Sync
    Postgres --> Realtime