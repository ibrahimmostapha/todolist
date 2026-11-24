# TaskFlow — Full-Stack To-Do List

A simple, responsive full-stack To-Do List web application built with **React.js (Vite)**, **Node.js + Express.js**, and **PostgreSQL**.

## Features
- **3 Functional Pages:** Sign Up (`/signup`), Sign In (`/signin`), and My To-Do List (`/todos`).
- **Authentication:** Password hashing with `bcryptjs`, stateless JWT sessions, protected routes, and Logout.
- **To-Do Management:** Create tasks (title + description), inline edit title & description, toggle status (`ongoing` / `done`), filter by status, and delete tasks.
- **Persistent Storage:** All users and tasks are stored in PostgreSQL with per-user data isolation.

## Local Setup (Windows)

### 1. Start PostgreSQL (Docker Container)
Make sure Docker Desktop is running, then run:
```powershell
docker run -d --name todolist-postgres `
  -e POSTGRES_USER=todolist_user `
  -e POSTGRES_PASSWORD=todolist_pass `
  -e POSTGRES_DB=todolist_db `
  -p 5432:5432 `
  postgres:16-alpine
```

### 2. Run the Backend (Express API)
```powershell
cd backend
copy .env.example .env
npm.cmd install
npm.cmd run dev
```
The API runs at `http://localhost:5000` (health check: `GET http://localhost:5000/api/health`).

### 3. Run the Frontend (React + Vite)
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:5173` in your web browser.

## REST API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API & PostgreSQL health status |
| `POST` | `/api/auth/signup` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/signin` | Public | Sign in with `email` and `password` |
| `GET` | `/api/auth/me` | Bearer JWT | Get current authenticated user |
| `POST` | `/api/auth/logout` | Bearer JWT | Acknowledge logout |
| `GET` | `/api/todos` | Bearer JWT | List user's todos (optional `?status=ongoing\|done`) |
| `POST` | `/api/todos` | Bearer JWT | Create a todo (`title`, optional `description`) |
| `PATCH` | `/api/todos/:id` | Bearer JWT | Update `title`, `description`, and/or `status` |
| `DELETE` | `/api/todos/:id` | Bearer JWT | Delete a todo |
