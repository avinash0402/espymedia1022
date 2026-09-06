# Espy Media

A full-stack creative studio marketing website for Espy Media, built with React, Vite, TypeScript, and Tailwind CSS.

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Routing:** Wouter
- **Data fetching:** TanStack React Query
- **Animations:** Framer Motion
- **Monorepo:** pnpm workspaces

## Project structure

- `src/` — main app source (pages, components, hooks, lib)
- `src/pages/` — route-level page components (home, contact, blog, case-study, admin/*)
- `src/components/` — shared UI and section components
- `packages/api-client-react/` — workspace package with shared API fetch helpers and React Query hooks

## How to run

```bash
pnpm install
PORT=5000 BASE_PATH=/ pnpm run dev
```

The dev server starts on port 5000. The `PORT` and `BASE_PATH` environment variables are required by `vite.config.ts`.

## Pages

- `/` — Home (hero, services, work, process, pricing, testimonials)
- `/contact` — Contact form
- `/work/:id` — Case study detail
- `/blog` — Blog listing
- `/blog/:id` — Blog post detail
- `/admin` — Admin login
- `/admin/dashboard` — Admin dashboard
- `/admin/leads`, `/admin/projects`, `/admin/testimonials`, `/admin/blog`, `/admin/services`, `/admin/settings` — Admin sections

## User preferences

<!-- Add preferences here as they come up -->
