
# PomoMate – A smart Pomodoro timer that helps you stay focused, organize tasks, and boost productivity with AI-driven suggestions

## Languages/Frameworks used 
 
 React, Node.js, MongoDB

## Functionality

- Users can register, login, and logout.
- Users can create a tomato clock, setting the working time and pause time.
- The tomato clock can add some note, tag or category after finishing.
- Logged-in users can edit and delete their previous tomato clock.
- Database contains Users, Tomato clocks with the necessary collections and fields to maintain the above functionality.


## Creative Portion  
Integrating OpenAI API to generate information for tomato clock:

- Users can submit content, which is processed by OpenAI API to generate relevant tags, format the notes, and select the category.
- The AI can generate some suggestions next tomato clock for the user based on the work that has already been done, and the user can choose one of the suggestions to start the next Tomato Clock

## How to start

0. Copy the `.env_sample` file to `.env` and fill in the values.
1. Run `docker compose up --build` to build and start the application.
2. Open the frontend at `http://localhost:3000`.

## Docker Deployment Architecture

This project is deployed with Docker Compose and consists of three containers:

- `frontend`: Vite app built into static files and served by Nginx.
- `api`: Node.js/Express backend that handles authentication, tasks, and OpenAI requests.
- `mongo`: MongoDB database used to persist application data.

```text
Browser
  |
  v
frontend (Nginx, port 3000 on host -> 80 in container)
  |
  v
api (Express, port 9000 by default)
  |
  v
mongo (MongoDB, port 27017 by default)

api ----> OpenAI API
```

### Service Details

| Service | Image/Build | Default Host Port | Purpose |
| --- | --- | --- | --- |
| `frontend` | built from `client/Dockerfile` | `3000` | Serves the React UI through Nginx |
| `api` | built from `backend/Dockerfile` | `9000` | Runs the Express backend |
| `mongo` | `mongo:7` | `27017` | Stores users, Pomodoro records, and related data |

### Container Relationships

- The `frontend` container depends on the `api` container being healthy before it starts.
- The `api` container depends on the `mongo` container being healthy before it starts.
- The `api` container connects to MongoDB through the internal Docker network using `mongo` as the hostname.
- MongoDB data is persisted through the named Docker volume `mongo-data`.

### Environment Variables

The Docker setup reads values from `.env` and also provides sensible defaults in `docker-compose.yml`.

Required secrets:

- `OPENAI_SECRET_API_KEY`: API key used for AI-powered suggestions and note processing.

Optional overrides:

- `API_PORT` default: `9000`
- `FRONTEND_PORT` default: `3000`
- `MONGO_PORT` default: `27017`
- `MONGO_URI` default: `mongodb://mongo:27017/pomomate`
- `MONGO_INITDB_DATABASE` default: `pomomate`
- `JWT_SECRET_KEY` default: `replace-me`
- `VITE_API_BASE_URL` default: `http://localhost:9000`

If `MONGO_URI` or `JWT_SECRET_KEY` is missing or left empty, the backend falls back to the default values above.

### Health Checks

- `mongo` is considered healthy after responding to `db.runCommand({ ping: 1 })`.
- `api` is considered healthy after responding successfully to `http://localhost:<API_PORT>/test`.
- Compose uses these health checks to control startup order between services.

### Common Docker Commands

Start in detached mode:

```bash
docker compose up -d --build
```

Stop the containers:

```bash
docker compose down
```

Stop the containers and remove the database volume:

```bash
docker compose down -v
```