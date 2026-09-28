# AGENTS Guidelines: Todo List App

## 1. Project overview (what to build)

A responsive todo list app. Users must be able to:

- Add new todos to the list
- Mark todos as complete
- Delete todos from the list
- Filter by all / active / completed todos
- Clear all completed todos
- Toggle light and dark mode
- View the optimal layout for their device's screen size (mobile, tablet, desktop)
- See hover states on all interactive elements

Bonus (build only after everything above works):

- Drag and drop to reorder items
- Full-stack version with API endpoints

## 2. Tech stack

- Next.js (App Router) with TypeScript
- Tailwaind CSS
- Vitest for tests
- Everything must be free to run and deploy on Vercel

## 3. Build and run commands

- `npm install` to install dependencies
- `npm run dev` while working
- `npm run lint` to check code
- `npm run test` to run tests
- Do not run `npm run build` while iterating. Run it only once at the end, before deployment, to confirm it succeeds.

## 4. Code style

- TypeScript for all components and utilities
- Clear names, short comments, small components
- Mobile-first CSS
- Every button, link, and checkbox needs a hover state and a visible focus state
- Store the theme (light/dark) and todos in localStorage until the API exists

## 5. UI details

- Show a friendly message when the list is empty
- Do not allow empty or whitespace-only todos
- Show the count of items left
- Keep text readable in both themes (good contrast)
- Everything must be usable with a keyboard

## 6. API and testing rules

- Write a test for every endpoint you create.
- After creating or changing an endpoint, run `npm run test` and confirm it passes before moving on.
- Always validate that each endpoint works: correct status codes, correct response data, and proper errors for bad input (empty title, unknown id).
- Never say a task is done while any test is failing.

Planned endpoints (bonus, full-stack):

- `GET /api/todos` list todos (supports filter)
- `POST /api/todos` add a todo
- `PATCH /api/todos/:id` mark complete or reorder
- `DELETE /api/todos/:id` delete one todo
- `DELETE /api/todos?completed=true` clear all completed

## 7. Security

- Never hardcode API keys or secrets
- Validate and sanitize all user input on the server
- Do not commit `.env` files

## 8. Scope limits

- Build only what is listed in the project overview
- Do not add extra libraries without asking me first
- Do not rewrite working code unless I ask
- If something is unclear, ask me before guessing

## 9. Definition of done

A feature is done only when:

- It works in the browser at phone and desktop sizes
- It works in both light and dark mode
- Lint and tests pass
- There are no console errors

## 10. Git

- Make a small commit after each work-order step with a clear message
- Never commit node_modules or .env files

## 11. Documentation

- Keep a short README with what the app does, how to run it, and the live link

## 12. Work order

1. Set up the project and base layout
2. Add, complete, and delete todos
3. Filters (all / active / completed) and clear completed
4. Light and dark mode toggle
5. Responsive layout and hover states
6. Test on a phone-sized screen
7. Bonus: drag and drop reorder
8. Bonus: API endpoints with tests
9. Run the production build once and confirm everything works before deployment
   - Do not create files that are not needed for the listed features
   - Do not create extra documentation, notes, or duplicate files
   - Before creating any new file, tell me its name and why it is needed

- Load saved data from localStorage before saving anything. Never overwrite stored data with an empty initial state. Todos and theme must survive a page reload.
