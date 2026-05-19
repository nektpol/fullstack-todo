# Fullstack Todo SaaS

A production-style fullstack todo application focused on secure authentication, recurring task workflows, and clean service boundaries.

This project was built as a portfolio piece to demonstrate practical backend API design in Rust and modern frontend implementation in Next.js.

## Why This Project

Most todo apps stop at CRUD. This one adds recurring completion logic (daily/weekly/monthly) and period-aware "done" states, which introduces real product logic beyond simple checkboxes.

## Features

- User registration and login
- Secure password hashing with Argon2
- JWT-based authentication
- Protected todo routes with auth middleware
- Create, read, update, delete todos
- Recurring todo frequencies: daily, weekly, monthly
- Mark-as-done per active time period
- Responsive dashboard UI with optimistic-feeling interactions
- Toast feedback for success/error events

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- React Hot Toast

### Backend

- Rust (Edition 2024)
- Axum
- Tokio
- SQLx (PostgreSQL)
- JWT (jsonwebtoken)
- Argon2
- dotenvy

### Data

- PostgreSQL
- SQLx migrations

## Architecture

- `frontend/`: Next.js client app (login, signup, dashboard)
- `backend/`: Rust API with route modules, middleware, services, and models
- `backend/migrations/`: schema and completion-period migration history

Core backend route groups:

- `POST /auth/register`
- `POST /auth/login`
- `GET /todos`
- `POST /todos`
- `PUT /todos/{id}`
- `DELETE /todos/{id}`
- `POST /todos/{id}/complete`

## Recurring Todo Logic

Todos can be configured as `daily`, `weekly`, or `monthly`.

When a user marks a todo as complete, completion is tracked against the current period window. The app then computes whether a todo is done for the current period, rather than treating completion as a permanent state.

This pattern is useful for habit tracking and routine management products.

## Local Setup

## Prerequisites

- Node.js + npm
- Rust + Cargo
- PostgreSQL

## 1. Configure Backend Environment

Create `backend/.env`:

```env
DATABASE_URL=postgres://<user>:<password>@localhost/<db_name>
JWT_SECRET=replace_with_a_strong_secret
```

## 2. Run Database Migrations

From `backend/`:

```bash
sqlx migrate run
```

## 3. Start Backend

From `backend/`:

```bash
cargo run
```

Backend runs on `http://localhost:3000`.

## 4. Start Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3001`.

## Optional: One-click Local Startup (Windows)

From the repo root:

```bat
run-project.bat
```

This starts backend and frontend in separate terminals.

## Security Notes

- Password policy is enforced both client-side and server-side
- Passwords are hashed with Argon2
- JWT tokens are validated in request middleware
- In production, use a strong JWT secret and secure storage practices

## Portfolio Highlights

This project demonstrates:

- Building a typed REST API in Rust
- Designing authentication and authorization flows
- Implementing period-based business logic
- Structuring a fullstack application into clear modules
- Integrating a React frontend with protected API calls and query invalidation

## Roadmap

- Refresh token strategy and token expiration UX
- User profile and account settings
- Better test coverage (integration + end-to-end)
- Dockerized local development
- CI pipeline for lint/test/build

## Repository Structure

```text
fullstack-todo/
  backend/
    src/
      routes/
      middleware/
      models/
      services/
    migrations/
  frontend/
    app/
    components/
    lib/
  run-project.bat
```

## Author

Built by [your name].

If you want, I can also generate a polished "About this project" section tailored to your personal brand and preferred job role (frontend, backend, or fullstack focus).
