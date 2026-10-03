# AGENTS.md

## Project
MickyHill Todo: a single-page todo list app built for HNG Internship 15, Task 1.

## Stack
- React 19 with Vite
- Plain CSS with CSS variables (src/index.css for theme tokens, src/App.css for layout)
- lucide-react for icons
- localStorage for persistence (no backend)

## Features
- Add tasks with priority (low, medium, high) and optional due date
- Mark done, edit inline, delete
- Filter: All, Active, Completed
- Progress bar, overdue highlighting, clear completed
- Light and dark theme

## Commands
- npm install: install dependencies
- npm run dev: start local dev server at http://localhost:5173
- npm run build: production build into dist/

## Rules for agents
- Keep all app logic in src/App.jsx unless a component is reused.
- Use the CSS variables in src/index.css. Never hardcode colours in App.css.
- Keep the app working without a backend. Data lives in localStorage under the key mickyhill-todos-v1.
- Every interactive element needs an aria-label or visible text.
- Run npm run build and confirm no errors before committing.