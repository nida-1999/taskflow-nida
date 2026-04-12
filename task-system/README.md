## Overview

#### TaskFlow is a task management system where users can:
- Register or sign in with email and password
- Create, edit and delete project
- Add task to projects
- Drag and drop task from one status to another
- Filter task based on status (todo, in-progress, review, done), priority (low, medium, high), project, and due date.
- Can view the task in two views: list view and kanban board view according to their preference.

### Tech Stack:

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios
- Db: JSON Server
- Infrastructure: Docker + Docker Compose

## Architecture Decisions

### Tech decisions: 
- Tailwind CSS — Ship consistent UI faster by styling directly in JSX, with no stylesheet context-switching.
- React Router v6 — protected routes via wrapper component, not HOC.
- Axios — Intercept every request and response in one place, making auth headers, error handling, and retries globally consistent.
- @dnd-kit — Drag-and-drop that works with pointer, keyboard, and touch out of the box, with no extra accessibility work.

### Code decisions:
- Abstracted out common parts/styles across components for reusability
- Used context api for global state management
- Used protected routes for authentication

### Running Locally
```bash
git clone https://github.com/nida-1999/taskflow-nida
cd taskflow-nida
docker compose up

# App available at http://localhost:80
```
## 4. Test Credentials

- Email: `alice@gmail.com`
- Password: `pass123@`

## 5. What You'd Do With More Time

- Real-time updates via SSE
- Add pagination
- End to end testing
- Tags/labels in tasks and filtering accordingly
- Seamless UI of task view  & edit
- Marking a task as duplicate of another
- Copy task permalink for sharing