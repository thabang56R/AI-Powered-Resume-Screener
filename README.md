# Agentic Resume Screener — Full MERN + Docker Compose

This repo is a full **MERN** (MongoDB, Express, React, Node) project scaffold with an Agentic orchestrator that uses a free rule-based LLM adapter by default. It includes Dockerfiles and a `docker-compose.yml` so you can run the entire stack locally.

## Quick start (requires Docker & Docker Compose)
1. Copy `backend/.env.example` to `backend/.env` and set any optional tokens.
2. From the project root run:

```bash
docker compose up --build
```

3. Open the app UI at http://localhost:3000

## Development (without Docker)
- Backend: `cd backend && npm install && npm run dev` (needs Node 18+)
- Frontend: `cd frontend && npm install && npm run dev` (Vite dev server)
