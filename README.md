# PomoMate

A smart Pomodoro timer that helps you stay focused, organize tasks, and boost productivity with AI-driven suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React-Bootstrap, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB 7, Mongoose |
| AI | OpenAI API (GPT-4o-mini) |
| Auth | JWT, bcrypt |
| DevOps | Docker Compose, Nginx |

## Features

- **Pomodoro Timer** -- Circular progress ring with configurable work/break durations, sound alerts, and browser notifications
- **Task Management** -- Create, edit, and delete tasks organized by category with expand/collapse groups
- **AI Task Prediction** -- Uses OpenAI to analyze task history and suggest the next task with reasoning
- **Productivity Dashboard** -- Bar chart (last 7 days) and pie chart (category distribution) powered by Recharts
- **Dark Mode** -- Full dark/light theme toggle with CSS custom properties
- **Demo Account** -- One-click demo login to explore the app without registration
- **Responsive Design** -- Optimized for desktop and mobile viewports

## Architecture

```text
Browser
  |
  v
Frontend (Nginx, port 3000)
  |
  v
API (Express, port 9000)
  |
  v
MongoDB (port 27017)

API ----> OpenAI API
```

All three services run as Docker containers orchestrated by Docker Compose, with health checks controlling startup order.

## Getting Started

### Option 1: Docker Compose (Recommended)

The easiest way to run the full stack. Requires [Docker](https://docs.docker.com/get-docker/) installed.

1. Copy `.env_sample` to `.env` and fill in your `OPENAI_SECRET_API_KEY`
2. Run:

```bash
docker compose up --build
```

3. Open http://localhost:3000

Common commands:

```bash
docker compose up -d --build   # Start in background
docker compose down            # Stop containers
docker compose down -v         # Stop and remove data
```

### Option 2: Run Without Docker

Requires Node.js 18+ and a running MongoDB instance.

1. Copy `.env_sample` to `.env` and fill in the values. Set `MONGO_URI` to your local MongoDB (e.g. `mongodb://localhost:27017/pomomate`).

2. Start the backend:

```bash
cd backend
npm install
npm start
```

The API server will start on http://localhost:9000.

3. In a separate terminal, start the frontend:

```bash
cd client
npm install
npm run dev
```

The Vite dev server will start on http://localhost:5173. The frontend connects to the API at the URL defined by `VITE_API_BASE_URL` (defaults to `/api` in Docker with Nginx proxy, and can be set to `http://localhost:9000` for local dev).

### Environment Variables

| Variable | Default | Required |
|----------|---------|----------|
| `OPENAI_SECRET_API_KEY` | -- | Yes |
| `JWT_SECRET_KEY` | `replace-me` | Recommended |
| `MONGO_URI` | `mongodb://mongo:27017/pomomate` | Yes (non-Docker: use `localhost`) |
| `API_PORT` | `9000` | No |
| `FRONTEND_PORT` | `3000` | No |
| `MONGO_PORT` | `27017` | No |
