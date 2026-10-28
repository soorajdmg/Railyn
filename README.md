# Railyn — Indian Railways Network Explorer

A comprehensive web application to explore the Indian Railways network: stations, train services, timetables, and geographic routes.

> **Development Strategy:** Start with Kerala regional prototype → expand to nationwide coverage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS |
| Backend | Python FastAPI (async) |
| Database | PostgreSQL 15 + PostGIS 3.x |
| Data Pipeline | Python + Pandas + GeoPandas |
| Dev Infra | Docker Compose |

## Project Structure

```
railyn/
├── frontend/          # React/Vite SPA
├── backend/           # FastAPI application
├── pipeline/          # Data ingestion scripts
├── db/
│   ├── migrations/    # Alembic migration files (managed via backend)
│   └── seeds/         # Seed data scripts
├── docs/              # Architecture docs, data source notes
├── infra/             # Docker Compose and deployment configs
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### 1. Start the Database

```bash
cd infra
docker compose up -d
```

This starts a PostGIS-enabled PostgreSQL instance on port `5432`.

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy env template
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. Run the Data Pipeline (optional, for seeding data)

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://railyn_user:railyn_pass@localhost:5432/railyn` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:5173` |
| `DEBUG` | Enable debug mode | `true` |

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_MAP_STYLE_URL` | MapLibre map style URL | `https://tiles.openfreemap.org/styles/liberty` |

## Data Sources

See [docs/data-sources.md](docs/data-sources.md) for full details on data provenance and licensing.

## Development Workflow

### Database Schema Changes

1. Edit SQLAlchemy models in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Apply: `alembic upgrade head`

## License

MIT
