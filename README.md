# Todo App

A responsive todo list app built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features

- Add, complete, and delete todos
- Filter by all / active / completed
- Clear all completed todos
- Toggle light and dark mode
- Responsive layout for mobile, tablet, and desktop
- Hover and focus states on all interactive elements
- Friendly empty-state messages
- Input validation (no empty or whitespace-only todos)
- Persists todos and theme to localStorage
- Drag and drop to reorder, with move buttons and Alt+Arrow shortcuts

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest test suite |

## Testing

Tests use Vitest with jsdom and Testing Library:

- `src/lib/storage.test.ts` - localStorage persistence and helpers
- `src/lib/todoStore.test.ts` - server-side store, validation, and reordering
- `src/components/AddTodo.test.tsx` - add/validation behavior
- `src/components/TodoItem.test.tsx` - toggle, delete, drag and drop
- `src/components/FilterBar.test.tsx` - filtering and clear completed
- `src/app/page.test.tsx` - full app flow, theme, keyboard access
- `src/app/api/todos/route.test.ts` - GET, POST, DELETE endpoints
- `src/app/api/todos/[id]/route.test.ts` - PATCH and DELETE by id

Run `npm run test` to execute them.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/todos?filter=all\|active\|completed` | List todos (filter optional) |
| `POST` | `/api/todos` | Create a todo from `{ "title": "..." }` |
| `PATCH` | `/api/todos/:id` | Update with `{ "completed": bool }` or `{ "position": int }` |
| `DELETE` | `/api/todos/:id` | Delete one todo |
| `DELETE` | `/api/todos?completed=true` | Clear all completed todos |

Errors: `400` for invalid input (empty title, bad filter, malformed JSON),
`404` for an unknown id.

Todos live in an in-memory store, so they reset when the server restarts. The
UI uses localStorage and does not call these endpoints yet.

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Vitest + Testing Library

## Deployment

Deploy on Vercel with one click from this repository.