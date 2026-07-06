# Task Manager App

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

A modern task management application built with Next.js, designed to help users efficiently organize, track, and manage their daily activities.

## Quick Start
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up environment: `cp .env.example .env` (if applicable)
4. Run the dev server: `npm run dev`

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run linter |

## Architecture
The project is built using **Next.js (App Router)** and follows a modern, local-first web architecture:

- **Frontend Framework**: Next.js 16 (App Router) providing React Server Components and optimized routing.
- **State Management**: [@legendapp/state](https://legendapp.com/open-source/state/) for local-first, highly responsive, and reactive state management.
- **Backend & Database**: [Supabase](https://supabase.com/) for authentication and persistent cloud storage.
- **UI & Styling**: 
  - **Tailwind CSS v4** for utility-first styling.
  - **Headless UI** and **Framer Motion** for accessible, animated interactive components like modals and dropdowns.
  - **Lucide React** for consistent iconography.
- **Testing**: Configured with **Vitest**, **React Testing Library**, and **Jest DOM** for robust component testing.

### Folder Structure
- `src/app/` - Next.js App Router pages and layouts.
- `src/components/` - Feature-based React components (e.g., `tasks/`, `categories/`, `auth/`, `sidebar/`).
- `src/lib/` - Core utilities, including state models (`state/`), database clients (`supabase.ts`), and sync logic (`sync/`).


