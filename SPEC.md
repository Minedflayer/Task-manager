# Spec: Premium Offline-First Task Manager

## Objective
We are building a premium, highly tactile personal task manager dashboard. The application provides an offline-first experience using Legend-State and IndexedDB, with background real-time synchronization to Supabase PostgreSQL. Users can organize tasks into custom categories (with curated pastel colors) and schedule them by dragging them directly from lists onto a daily or weekly calendar grid.

### User Stories & Core Flows
1. **Unauthenticated / Guest Mode:**
   - A user lands on a beautiful, glassmorphic auth page.
   - They can click "Try as Guest" to immediately access the dashboard.
   - All tasks, categories, and calendar events created in guest mode are saved locally in the browser's IndexedDB.
2. **Authentication & Data Migration:**
   - Users can sign up or log in using Email/Password or Supabase Magic Links.
   - Upon logging in, any offline data created as a guest is seamlessly synced to their new Supabase account.
3. **Category Management:**
   - Users can create, update, and delete categories (e.g. "Job", "Personal projects", "Events") in the sidebar.
   - When creating a category, the user selects from a curated pastel color palette.
4. **Task Management & Custom Lists:**
   - Users can add, edit, delete, and check off tasks within a category.
   - Toggling task completion displays a satisfying spring animation and smooth list adjustment.
5. **Drag-and-Drop Calendar Scheduling:**
   - The dashboard includes an interactive calendar panel with a toggle for **Daily** and **Weekly** views.
   - Users can drag a task card from the task list and drop it onto a date/time slot on the calendar.
   - The drop target snaps magnet-like with spring physics, and the task's schedule date is updated in the database/IndexedDB in the background.
6. **Real-time Synchronization:**
   - If logged in on multiple browsers/devices, changes sync instantly via Supabase Realtime web sockets. Local UI states update with smooth transitions instead of harsh page flashes.

---

## Tech Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** TailwindCSS v4
- **State Management:** Legend-State (with fine-grained reactivity and IndexedDB persistence plugin)
- **Backend & Database:** Supabase (Auth, PostgreSQL, Realtime Web Sockets)
- **Animations & Drag-and-Drop:** Framer Motion (for spring animations, micro-interactions, layout transitions) + `@dnd-kit/core` & `@dnd-kit/modifiers` (for highly customizable drag-and-drop physics)
- **Icons:** Lucide React

---

## Commands
- **Install Dependencies:** `npm install`
- **Run Local Dev Server:** `npm run dev`
- **Build Production Bundle:** `npm run build`
- **Start Production Server:** `npm run start`
- **Lint Code:** `npm run lint`
- **Run Test Suite:** `npm test`

---

## Project Structure
```
task-manager-app/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── page.tsx        # Dashboard / Landing Page loader
│   │   ├── auth/           # Login, signup, and logout pages
│   │   ├── layout.tsx      # Root layout (metadata, fonts, providers)
│   │   └── providers.tsx   # Supabase, Legend-State, and Theme contexts
│   ├── components/         # Reusable UI components
│   │   ├── sidebar/        # Category navigation & profile info
│   │   ├── calendar/       # Daily / Weekly calendar view grid
│   │   ├── tasks/          # Task lists, cards, and input controls
│   │   └── ui/             # Core design system components (buttons, dialogs, cards)
│   ├── db/                 # Database schema definitions & migrations
│   │   └── schema.sql      # Supabase/PostgreSQL schema setup
│   ├── lib/                # Shared utilities & configurations
│   │   ├── supabase.ts     # Supabase client setup
│   │   └── state/          # Legend-State observable stores and IndexedDB sync
│   └── types/              # TypeScript global type definitions
├── SPEC.md                 # Technical specification (this file)
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # Tailwind configurations (if required for v4 compatibility)
```

---

## Database Schema (PostgreSQL / Supabase)

### 1. `categories`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users, nullable for guests/offline fallback)
- `name` (text, not null)
- `color` (text, hex or Tailwind-friendly code for pastel theme)
- `created_at` (timestamp with time zone, default now())

### 2. `tasks`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users, nullable for guests)
- `category_id` (UUID, references categories, on delete cascade, nullable)
- `title` (text, not null)
- `description` (text, nullable)
- `status` (text, default 'pending' - ['pending', 'done', 'due'])
- `scheduled_date` (date, nullable)
- `scheduled_time` (time without time zone, nullable)
- `created_at` (timestamp with time zone, default now())
- `updated_at` (timestamp with time zone, default now())

---

## Code Style

We write clean, semantic TypeScript and React. Here is an example of the coding standard (Legend-State fine-grained rendering style):

```tsx
"use client";

import { useObservable, observer } from "@legendapp/state/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TaskCardProps {
  taskId: string;
  title: string;
  categoryColor: string;
  initialDone: boolean;
  onToggle: (id: string, done: boolean) => void;
}

export const TaskCard = observer(function TaskCard({
  taskId,
  title,
  categoryColor,
  initialDone,
  onToggle,
}: TaskCardProps) {
  // Use local observable for smooth micro-interactions
  const isDone = useObservable(initialDone);

  const handleToggle = () => {
    const newValue = !isDone.get();
    isDone.set(newValue);
    onToggle(taskId, newValue);
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleToggle}
    >
      <button
        type="button"
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
          isDone.get()
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {isDone.get() && <Check size={14} className="stroke-[3]" />}
      </button>
      
      <span
        className={`text-slate-800 font-medium transition-all ${
          isDone.get() ? "line-through text-slate-400" : ""
        }`}
      >
        {title}
      </span>
      
      <div
        className="w-3 h-3 rounded-full ml-auto"
        style={{ backgroundColor: categoryColor }}
      />
    </motion.div>
  );
});
```

---

## Testing Strategy
- **Framework:** Vitest + React Testing Library (for unit and hook tests)
- **E2E/Integration Testing:** Playwright (for verifying drag-and-drop behavior, IndexedDB offline support, and multi-tab Supabase Realtime sync).
- **Test Locations:**
  - Unit tests live next to component files, e.g. `src/components/tasks/TaskCard.test.tsx`
  - Integration and E2E tests live in `/tests/e2e/`
- **Key Test Focuses:**
  - Offline task persistence in IndexedDB.
  - Verification of data migration from Guest to Logged-in accounts.
  - Checking off a task triggers completion callback and state update.
  - Dragging a task onto the calendar dispatches update actions.

---

## Boundaries

- **Always:**
  - Commit clean TypeScript code free of `any` types.
  - Run linting and unit tests before completing tasks.
  - Use exact variable name mappings corresponding to the database schema.
  - Keep styling consistent with the rounded-card pastel design system.
- **Ask first:**
  - Adding external npm packages for styling, physics, or utilities.
  - Altering the PostgreSQL database schema structure.
  - Modifying the Auth flows or redirect routes.
- **Never:**
  - Write plain/un-styled inline styles (always use Tailwind CSS classes).
  - Hardcode Supabase API credentials or environment secrets.
  - Force UI re-renders using window reloads when real-time updates are received.

---

## Success Criteria
- [ ] Users can browse, add, and complete tasks with guest mode enabled, data persistent on reload.
- [ ] Creating an account syncs local database state to Supabase.
- [ ] Users can drag a task card from a task list and drop it into both daily and weekly calendar views.
- [ ] The calendar and task list updates with zero layout shift or screen flicker, featuring spring animations.
- [ ] Real-time browser sync works seamlessly when running the app across two side-by-side windows.
- [ ] Build, lint, and type check commands pass without warnings or errors.

---

## Open Questions
1. **Supabase Migration / Initial Setup:** Do you have an existing Supabase project, or should we create a brand new one using the Supabase MCP server tools provided?
2. **Weekly Calendar View Structure:** In the weekly calendar, should tasks be dragged onto specific *days* (e.g. Monday vs. Tuesday columns), or does the weekly view support scheduling specific *hours* across the entire week?
