# Indian Railways Network Explorer — Project Task Breakdown

> **Project Codename:** Railyn
> **Stack:** React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS (Frontend) | Python FastAPI (Backend) | PostgreSQL + PostGIS (Database) | Python + Pandas + GeoPandas (Data Pipeline)
> **Development Strategy:** Start with Kerala regional prototype → expand to nationwide coverage

---

## Table of Contents

- [Phase 0: Project Setup & Infrastructure](#phase-0-project-setup--infrastructure)
- [Phase 1: Database Design & Schema](#phase-1-database-design--schema)
- [Phase 2: Data Acquisition & Ingestion Pipeline](#phase-2-data-acquisition--ingestion-pipeline)
- [Phase 3: Backend API (FastAPI)](#phase-3-backend-api-fastapi)
- [Phase 4: Frontend Foundation](#phase-4-frontend-foundation)
- [Phase 5: Map Integration](#phase-5-map-integration)
- [Phase 6: Train Features](#phase-6-train-features)
- [Phase 7: Station Features](#phase-7-station-features)
- [Phase 8: Railway Administration Features](#phase-8-railway-administration-features)
- [Phase 9: Search & Discovery](#phase-9-search--discovery)
- [Phase 10: Performance & Scalability](#phase-10-performance--scalability)
- [Phase 11: Data Quality & Validation](#phase-11-data-quality--validation)
- [Phase 12: Regional Expansion](#phase-12-regional-expansion)
- [Phase 13: Testing & QA](#phase-13-testing--qa)
- [Phase 14: Deployment & DevOps](#phase-14-deployment--devops)
- [Appendix: Data Sources](#appendix-data-sources)
- [Appendix: Architectural Decisions](#appendix-architectural-decisions)

---

## Phase 0: Project Setup & Infrastructure

### Task 0.1 — Repository & Monorepo Structure

**Description:** Establish the project repository with a clean monorepo layout separating frontend, backend, and data pipeline concerns.

**Steps:**
1. Create root project directory `railyn/`
2. Create subdirectories:
   - `railyn/frontend/` — React/Vite app
   - `railyn/backend/` — FastAPI app
   - `railyn/pipeline/` — Data ingestion scripts
   - `railyn/db/` — SQL migrations and seed scripts
   - `railyn/docs/` — Architecture docs, data source notes
   - `railyn/infra/` — Docker, docker-compose, deployment configs
3. Initialise git repository at root
4. Create `.gitignore` covering Python (`__pycache__`, `.venv`, `*.pyc`), Node (`node_modules`, `dist`), environment files (`.env`), and large data files (`*.geojson`, `*.shp`, `*.csv` unless explicitly tracked)
5. Create root `README.md` with project overview, tech stack, and quick-start instructions

**Acceptance Criteria:**
- Repository is initialised with the described folder structure
- `.gitignore` prevents accidental commits of secrets and large data files
- README exists with setup instructions

---

### Task 0.2 — Frontend Scaffold (React + TypeScript + Vite)

**Description:** Bootstrap the React frontend with TypeScript, Vite, and Tailwind CSS.

**Steps:**
1. Inside `frontend/`, run: `npm create vite@latest . -- --template react-ts`
2. Install dependencies:
   - `npm install tailwindcss @tailwindcss/vite`
   - `npm install maplibre-gl`
   - `npm install react-router-dom`
   - `npm install @tanstack/react-query` (for server state management)
   - `npm install axios` (HTTP client)
3. Configure Tailwind — add `@tailwind base/components/utilities` to `index.css`, configure `tailwind.config.ts`
4. Configure Vite proxy for local backend: in `vite.config.ts`, add `server.proxy` pointing `/api` to `http://localhost:8000`
5. Set up folder structure inside `src/`:
   - `src/components/` — reusable UI components
   - `src/pages/` — route-level page components
   - `src/hooks/` — custom React hooks
   - `src/services/` — API call functions
   - `src/types/` — TypeScript interfaces and types
   - `src/utils/` — helper functions
   - `src/store/` — global state (if needed)
6. Set up `react-router-dom` with a root `App.tsx` containing route definitions (placeholders are fine at this stage)
7. Verify dev server runs with `npm run dev`

**Acceptance Criteria:**
- `npm run dev` starts the app on `localhost:5173` without errors
- Tailwind styles apply correctly (test with a utility class)
- Folder structure is in place

---

### Task 0.3 — Backend Scaffold (Python FastAPI)

**Description:** Bootstrap the FastAPI backend with virtual environment, dependency management, and project structure.

**Steps:**
1. Inside `backend/`, create a Python virtual environment: `python -m venv .venv`
2. Activate and install dependencies:
   ```
   pip install fastapi uvicorn[standard] sqlalchemy asyncpg psycopg2-binary alembic
   pip install geoalchemy2 shapely
   pip install python-dotenv pydantic pydantic-settings
   pip install httpx  # for testing async endpoints
   ```
3. Create `requirements.txt` with pinned versions
4. Set up folder structure inside `backend/`:
   - `app/main.py` — FastAPI app instance and router registration
   - `app/api/` — route modules (trains, stations, zones, search)
   - `app/models/` — SQLAlchemy ORM models
   - `app/schemas/` — Pydantic request/response schemas
   - `app/crud/` — database query functions
   - `app/core/` — config, database connection, middleware
   - `app/utils/` — helpers
5. Create `app/core/config.py` using `pydantic-settings` to load from `.env`:
   - `DATABASE_URL`
   - `ALLOWED_ORIGINS` (for CORS)
   - `DEBUG`
6. Create `app/core/database.py` with SQLAlchemy async engine and session factory
7. Add CORS middleware in `main.py` allowing the frontend origin
8. Create a health-check endpoint `GET /api/health` returning `{"status": "ok"}`
9. Verify server runs with `uvicorn app.main:app --reload`

**Acceptance Criteria:**
- `uvicorn app.main:app --reload` starts without errors
- `GET /api/health` returns 200 with status ok
- `.env` file is not committed; `.env.example` with placeholders is

---

### Task 0.4 — Database Setup (PostgreSQL + PostGIS)

**Description:** Set up a local PostgreSQL instance with PostGIS extension enabled.

**Steps:**
1. Install PostgreSQL 15+ and PostGIS 3.x (or use Docker — see Task 0.5)
2. Create database: `CREATE DATABASE railyn;`
3. Create user: `CREATE USER railyn_user WITH PASSWORD 'your_password';`
4. Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE railyn TO railyn_user;`
5. Connect to database and enable extension: `CREATE EXTENSION IF NOT EXISTS postgis;`
6. Verify PostGIS: `SELECT PostGIS_Version();`
7. Set `DATABASE_URL` in backend `.env`:
   `postgresql+asyncpg://railyn_user:password@localhost:5432/railyn`

**Acceptance Criteria:**
- PostgreSQL is running and accessible
- `railyn` database exists with PostGIS enabled
- Backend can connect without errors

---

### Task 0.5 — Docker Compose for Local Development

**Description:** Create a `docker-compose.yml` to spin up PostgreSQL + PostGIS locally without manual DB installation.

**Steps:**
1. In `infra/`, create `docker-compose.yml`:
   ```yaml
   services:
     db:
       image: postgis/postgis:15-3.3
       environment:
         POSTGRES_DB: railyn
         POSTGRES_USER: railyn_user
         POSTGRES_PASSWORD: railyn_pass
       ports:
         - "5432:5432"
       volumes:
         - pgdata:/var/lib/postgresql/data
   volumes:
     pgdata:
   ```
2. Run `docker compose up -d` and verify connection
3. Document the docker compose workflow in `README.md`

**Acceptance Criteria:**
- `docker compose up -d` starts a PostGIS-enabled PostgreSQL instance
- Backend `.env` points to this instance successfully

---

### Task 0.6 — Database Migrations with Alembic

**Description:** Configure Alembic for managing database schema migrations.

**Steps:**
1. Inside `backend/`, run: `alembic init alembic`
2. Edit `alembic/env.py` to import SQLAlchemy models and use the app's database URL
3. Configure `alembic.ini` to read `DATABASE_URL` from `.env`
4. Create an initial empty migration to verify the setup: `alembic revision --autogenerate -m "initial"`
5. Run `alembic upgrade head` to apply
6. Document migration workflow:
   - Making schema changes → edit SQLAlchemy models → `alembic revision --autogenerate -m "description"` → `alembic upgrade head`

**Acceptance Criteria:**
- Alembic can generate and apply migrations without errors
- Migration history table exists in the database

---

## Phase 1: Database Design & Schema

> **Note:** Design the schema carefully before writing any migrations. All geographic coordinates use EPSG:4326 (WGS84 — standard GPS lat/lon). PostGIS geometry columns use `GEOGRAPHY` type for accurate distance calculations.

### Task 1.1 — Core Entity: Stations

**Description:** Design and create the `stations` table.

**Schema:**
```sql
CREATE TABLE stations (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    code          VARCHAR(10)  NOT NULL UNIQUE,  -- e.g., "TVC", "MAS"
    name_aliases  TEXT[],                         -- alternate names/spellings
    location      GEOGRAPHY(POINT, 4326),         -- PostGIS point (lon, lat)
    elevation_m   FLOAT,
    zone_id       INT REFERENCES zones(id),
    division_id   INT REFERENCES divisions(id),
    state         VARCHAR(100),
    is_junction   BOOLEAN DEFAULT FALSE,
    is_terminus   BOOLEAN DEFAULT FALSE,
    platform_count INT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stations_code ON stations(code);
CREATE INDEX idx_stations_location ON stations USING GIST(location);
```

**Steps:**
1. Write SQLAlchemy model in `app/models/station.py`
2. Generate Alembic migration
3. Apply migration
4. Write a seed script `db/seeds/stations_kerala.py` inserting ~50 major Kerala stations manually (for prototype)

**Key stations to seed for prototype:**
- TVC (Thiruvananthapuram Central), ERS (Ernakulam Junction), SRR (Shoranur Junction), CLT (Kozhikode), CAN (Kannur), KYJ (Kanyakumari), ALLP (Alappuzha), KTYM (Kottayam), TCR (Thrissur), PGT (Palakkad Junction), NCJ (Nagercoil Junction), QLN (Kollam Junction), VAD (Varkala Shivagiri)

**Acceptance Criteria:**
- `stations` table exists with all columns and indexes
- PostGIS index on `location` column works
- Seed data loads without errors
- `SELECT code, name FROM stations WHERE code = 'TVC';` returns correct result

---

### Task 1.2 — Core Entity: Railway Zones & Divisions

**Description:** Design and create `zones` and `divisions` tables representing the administrative hierarchy.

**Schema:**
```sql
CREATE TABLE zones (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,   -- e.g., "Southern Railway"
    code       VARCHAR(10)  NOT NULL UNIQUE,  -- e.g., "SR"
    hq_city    VARCHAR(100),
    hq_station_code VARCHAR(10) REFERENCES stations(code),
    website    VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE divisions (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,   -- e.g., "Thiruvananthapuram Division"
    code       VARCHAR(10)  NOT NULL UNIQUE,  -- e.g., "TVC"
    zone_id    INT NOT NULL REFERENCES zones(id),
    hq_city    VARCHAR(100),
    hq_station_code VARCHAR(10) REFERENCES stations(code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Zones to seed:**
CR, ER, ECR, ECoR, NR, NCR, NER, NFR, NWR, SR, SCR, SER, SECR, SWR, WR, WCR, Metro (Kolkata Metro), KR (Konkan Railway)

**Divisions under SR to seed (for prototype):**
Thiruvananthapuram, Palakkad, Salem, Chennai, Madurai

**Acceptance Criteria:**
- Both tables exist with foreign key relationships
- All 18 zones seeded
- SR divisions seeded

---

### Task 1.3 — Core Entity: Railway Lines / Corridors

**Description:** Design the `railway_lines` table representing named railway corridors (e.g., "Thiruvananthapuram–Mangaluru Coast Line").

**Schema:**
```sql
CREATE TABLE railway_lines (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    code          VARCHAR(50),
    line_type     VARCHAR(50),   -- 'mainline', 'branch', 'suburban', 'metro'
    gauge         VARCHAR(20) DEFAULT 'BG',  -- 'BG' (broad), 'MG' (metre), 'NG' (narrow)
    electrified   BOOLEAN DEFAULT FALSE,
    zone_id       INT REFERENCES zones(id),
    geometry      GEOMETRY(LINESTRING, 4326),  -- full line geometry
    length_km     FLOAT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_railway_lines_geom ON railway_lines USING GIST(geometry);
```

**Acceptance Criteria:**
- Table exists with spatial index
- At least the Kerala Coast Line and Palakkad–Ernakulam line seeded

---

### Task 1.4 — Core Entity: Train Services

**Description:** Design the `trains` table representing scheduled train services.

**Schema:**
```sql
CREATE TABLE trains (
    id              SERIAL PRIMARY KEY,
    train_number    VARCHAR(10) NOT NULL UNIQUE,  -- e.g., "12625"
    name            VARCHAR(255) NOT NULL,          -- e.g., "Kerala Express"
    train_type      VARCHAR(50),   -- 'Express', 'Superfast', 'Passenger', 'EMU', 'Jan Shatabdi', etc.
    source_station_code  VARCHAR(10) REFERENCES stations(code),
    destination_station_code VARCHAR(10) REFERENCES stations(code),
    distance_km     FLOAT,
    duration_minutes INT,
    runs_on         BOOLEAN[7],  -- [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    zone_id         INT REFERENCES zones(id),  -- owning zone
    route_geometry  GEOMETRY(LINESTRING, 4326),  -- precomputed full route geometry
    classes         TEXT[],  -- ['1A','2A','3A','SL','CC','2S']
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_source ON trains(source_station_code);
CREATE INDEX idx_trains_dest ON trains(destination_station_code);
CREATE INDEX idx_trains_route_geom ON trains USING GIST(route_geometry);
```

**Trains to seed for prototype (Kerala-based):**
- 12625/12626 Kerala Express (TVC–NDLS)
- 12431/12432 Thiruvananthapuram Rajdhani
- 16301/16302 Venad Express
- 16345/16346 Netravati Express
- 22113/22114 Kerala SF Express
- 16603/16604 Maveli Express
- 12083/12084 Jan Shatabdi (TVC–ERS)

**Acceptance Criteria:**
- Table with all columns and indexes exists
- 10+ prototype trains seeded

---

### Task 1.5 — Core Entity: Timetable Stops

**Description:** Design the `timetable_stops` table — the ordered list of stops for each train with timing data.

**Schema:**
```sql
CREATE TABLE timetable_stops (
    id              SERIAL PRIMARY KEY,
    train_id        INT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    station_code    VARCHAR(10) NOT NULL REFERENCES stations(code),
    stop_number     INT NOT NULL,   -- 1 = origin, increments per stop
    arrival_time    TIME,           -- NULL for origin station
    departure_time  TIME,           -- NULL for terminal station
    halt_minutes    INT GENERATED ALWAYS AS (
                        EXTRACT(EPOCH FROM (departure_time - arrival_time))/60
                    ) STORED,
    distance_from_origin_km FLOAT,
    day_offset      INT DEFAULT 0,  -- 0 = same day as departure, 1 = next day, etc.
    platform        VARCHAR(10),
    UNIQUE(train_id, stop_number),
    UNIQUE(train_id, station_code)  -- a train passes a station once (handle loops separately)
);
CREATE INDEX idx_stops_train ON timetable_stops(train_id);
CREATE INDEX idx_stops_station ON timetable_stops(station_code);
CREATE INDEX idx_stops_train_stop ON timetable_stops(train_id, stop_number);
```

**Note on `day_offset`:** Kerala Express from TVC departs Day 0; it arrives at NDLS on Day 1 (the next day). Stops after midnight get `day_offset = 1`. This is critical for correct time display.

**Acceptance Criteria:**
- Table exists with composite unique constraints
- Full timetable for Kerala Express (12625) seeded with all stops, times, and distances

---

### Task 1.6 — Core Entity: Physical Track Segments

**Description:** Design the `track_segments` table storing geometry for individual track sections between consecutive stations.

**Schema:**
```sql
CREATE TABLE track_segments (
    id              SERIAL PRIMARY KEY,
    from_station_code VARCHAR(10) NOT NULL REFERENCES stations(code),
    to_station_code   VARCHAR(10) NOT NULL REFERENCES stations(code),
    railway_line_id   INT REFERENCES railway_lines(id),
    geometry          GEOMETRY(LINESTRING, 4326) NOT NULL,
    length_km         FLOAT,
    gauge             VARCHAR(20) DEFAULT 'BG',
    electrified       BOOLEAN DEFAULT FALSE,
    max_speed_kmph    INT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_station_code, to_station_code)
);
CREATE INDEX idx_segments_from ON track_segments(from_station_code);
CREATE INDEX idx_segments_to ON track_segments(to_station_code);
CREATE INDEX idx_segments_geom ON track_segments USING GIST(geometry);
```

**Note:** Track segments are directional for simplicity. If needed, store both directions or use undirected logic in queries.

**Acceptance Criteria:**
- Table exists with spatial index
- Track segments for TVC–ERS coast corridor seeded using OSM-derived geometries

---

### Task 1.7 — Junction Table: Station ↔ Railway Lines

**Description:** Many-to-many relationship between stations and railway lines.

```sql
CREATE TABLE station_lines (
    station_code    VARCHAR(10) REFERENCES stations(code),
    railway_line_id INT REFERENCES railway_lines(id),
    PRIMARY KEY (station_code, railway_line_id)
);
```

**Acceptance Criteria:**
- Junction table exists
- Kerala coast stations linked to their respective lines

---

## Phase 2: Data Acquisition & Ingestion Pipeline

> **Important:** All data must come from publicly available, authorised, or appropriately licensed sources. Document every source. Indian Railways' National Train Enquiry System (NTES) and data.gov.in provide official data. OpenStreetMap data is licensed under ODbL.

### Task 2.1 — Research & Document Data Sources

**Description:** Identify, evaluate, and document all data sources before writing any ingestion code.

**Steps:**
1. **Station data:**
   - Primary: Indian Railways official station list from data.gov.in (search "Indian Railway Station" dataset)
   - Backup: OpenStreetMap — export railway stations in India using Overpass API
   - Overpass query: `node["railway"="station"]["country"="IN"]`
2. **Train timetable data:**
   - Primary: data.gov.in "Indian Railways Train Time Table" dataset
   - Secondary: NTES (National Train Enquiry System) — publicly accessible
   - Note: Scraping NTES may violate ToS; prefer official CSV/JSON datasets from data.gov.in
3. **Track geometry:**
   - Primary: OpenStreetMap (ODbL licensed) — download India railway network
   - Use Overpass API or Geofabrik India extract: `https://download.geofabrik.de/asia/india.html`
   - Filter for `railway=rail`, `railway=narrow_gauge`, etc.
4. Create `docs/data-sources.md` documenting:
   - Source name, URL, license, last verified date, format (CSV/JSON/Shapefile/GeoJSON)
   - Any limitations or caveats

**Acceptance Criteria:**
- `docs/data-sources.md` exists and lists all sources with licenses
- At least one station dataset and one timetable dataset downloaded and stored in `pipeline/raw_data/` (gitignored)

---

### Task 2.2 — Pipeline Project Structure

**Description:** Set up the data pipeline as a standalone Python project.

**Steps:**
1. Inside `pipeline/`, create:
   - `requirements.txt`: `pandas`, `geopandas`, `shapely`, `psycopg2-binary`, `sqlalchemy`, `python-dotenv`, `requests`, `fiona`
   - `pipeline/config.py` — loads DATABASE_URL from `.env`
   - `pipeline/utils/db.py` — database connection helper
   - `pipeline/utils/geo.py` — geometry helpers (e.g., linestring from coordinates)
   - `pipeline/loaders/` — one file per entity type
   - `pipeline/raw_data/` — gitignored directory for downloaded files
   - `pipeline/processed/` — gitignored directory for cleaned intermediary files
2. Create `pipeline/run.py` as orchestrator — runs loaders in dependency order

**Acceptance Criteria:**
- Pipeline virtualenv installs without errors
- `python pipeline/run.py --dry-run` executes without DB errors

---

### Task 2.3 — Station Data Ingestion

**Description:** Write the station loader script.

**Steps:**
1. Download station CSV from data.gov.in (or use the OSM Overpass export)
2. In `pipeline/loaders/load_stations.py`:
   - Load CSV with Pandas
   - Standardise column names
   - Validate station codes: must be 2–5 uppercase letters
   - Deduplicate by station code (keep the record with more complete data)
   - Match zone and division codes to IDs in the database
   - Convert lat/lon to PostGIS GEOGRAPHY POINT: `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`
   - Upsert into `stations` table (INSERT ... ON CONFLICT DO UPDATE)
3. Log: total records, inserted, updated, skipped (invalid), and error reasons

**Acceptance Criteria:**
- Script runs end-to-end without crashing
- Kerala stations (TVC, ERS, SRR, CLT, etc.) are present with correct coordinates and zone/division
- No duplicate station codes

---

### Task 2.4 — Timetable Data Ingestion

**Description:** Write the timetable loader — the most complex part of the pipeline.

**Steps:**
1. Download timetable CSV from data.gov.in
2. In `pipeline/loaders/load_timetables.py`:
   - Parse train number, name, and stop records
   - For each train:
     a. Look up or create a `trains` record
     b. Sort stops by `stop_number` (verify monotonic)
     c. Parse arrival/departure times — handle midnight crossovers by computing `day_offset`
     d. Look up `station_code` — if station not found, log warning and skip that stop
     e. Calculate halt duration in minutes
     f. Verify distance_from_origin is monotonically increasing
     g. Insert into `timetable_stops`
   - After all trains loaded, compute `runs_on` (days of operation) from source data
3. **Day offset calculation:**
   ```python
   def compute_day_offsets(stops):
       day = 0
       prev_dep = None
       for stop in stops:
           arr = stop['arrival_time']
           if prev_dep and arr and arr < prev_dep:
               day += 1
           stop['day_offset'] = day
           prev_dep = stop['departure_time'] or arr
       return stops
   ```

**Acceptance Criteria:**
- Full timetable for 10+ Kerala trains loaded
- Kerala Express (12625) has all 57+ stops with correct times and day offsets
- Stations referenced in timetables exist in the stations table (or warnings logged for unknowns)

---

### Task 2.5 — Track Geometry Ingestion (OSM)

**Description:** Extract railway track geometries from OpenStreetMap data.

**Steps:**
1. Download the India Geofabrik extract (PBF format): `india-latest.osm.pbf`
2. Use `osmium` or `osmfilter` to extract only railway ways:
   ```bash
   osmium tags-filter india-latest.osm.pbf w/railway=rail -o india-railways.osm.pbf
   ```
3. Convert to GeoJSON or Shapefile using `ogr2ogr`
4. In `pipeline/loaders/load_track_segments.py` using GeoPandas:
   - Load the railway GeoJSON
   - Clip to Kerala bounding box for prototype: `bbox = [74.8, 8.2, 77.5, 12.8]`
   - For each OSM way, try to match endpoints to known station coordinates within 500m
   - If both endpoints match stations, create a `track_segments` record
   - Store the geometry as PostGIS LINESTRING
5. For segments that cannot be auto-matched, log them for manual review

**Note:** Full auto-matching of all OSM segments to station pairs is imperfect. Start with major corridor segments and expand manually as needed.

**Acceptance Criteria:**
- Track geometry exists for the TVC–ERS coastal corridor
- At least 50% of major inter-station segments in Kerala are loaded
- Unmatched segments are logged with OSM way IDs for manual follow-up

---

### Task 2.6 — Precompute Train Route Geometries

**Description:** After loading timetable stops and track segments, compute the full route geometry for each train.

**Steps:**
1. In `pipeline/loaders/compute_route_geometries.py`:
   - For each train, fetch its ordered stops
   - For each consecutive pair (stop_n, stop_n+1), look up `track_segments` where `from_station_code = stop_n.code AND to_station_code = stop_n+1.code`
   - If segment found, collect its geometry
   - If not found, fall back to straight-line segment between station coordinates (mark as approximated)
   - Merge all segment geometries into a single LINESTRING using PostGIS: `ST_LineMerge(ST_Collect(...))`
   - Update `trains.route_geometry` with the result
2. Log: trains updated, segments found vs straight-line fallbacks

**Acceptance Criteria:**
- `trains.route_geometry` is populated for all prototype trains
- Kerala Express route geometry renders correctly on the map
- Approximated (straight-line) segments are flagged

---

### Task 2.7 — Data Validation & Import Status Tracking

**Description:** Add a tracking table and validation checks for data imports.

**Schema:**
```sql
CREATE TABLE import_runs (
    id           SERIAL PRIMARY KEY,
    source_name  VARCHAR(255),
    entity_type  VARCHAR(50),  -- 'stations', 'timetables', 'segments'
    records_total   INT,
    records_inserted INT,
    records_updated  INT,
    records_skipped  INT,
    errors_count     INT,
    error_log        TEXT,
    run_at           TIMESTAMPTZ DEFAULT NOW()
);
```

**Steps:**
1. Create `import_runs` table via Alembic migration
2. Modify all loader scripts to write an `import_runs` record at the end
3. Add validation checks:
   - Station coordinates within India bounding box: `[68.1, 6.7, 97.4, 35.7]`
   - Train stop sequences are strictly monotonic
   - Timetable distances are non-decreasing
   - Every timetable_stop references an existing station

**Acceptance Criteria:**
- `import_runs` table populated after each pipeline run
- Validation errors are logged and don't silently corrupt data

---

## Phase 3: Backend API (FastAPI)

### Task 3.1 — SQLAlchemy Models

**Description:** Create SQLAlchemy ORM models matching the database schema.

**Steps:**
1. Create model files in `app/models/`:
   - `station.py` — Station model with GeoAlchemy2 Geography column
   - `train.py` — Train model
   - `timetable_stop.py` — TimetableStop model
   - `zone.py` — Zone model
   - `division.py` — Division model
   - `railway_line.py` — RailwayLine model
   - `track_segment.py` — TrackSegment model
2. Create `app/models/__init__.py` exporting all models
3. Ensure all foreign key relationships are defined with SQLAlchemy `relationship()`

**Acceptance Criteria:**
- All models importable without errors
- `alembic check` shows no pending schema differences

---

### Task 3.2 — Pydantic Schemas

**Description:** Create Pydantic response schemas for all API endpoints.

**Steps:**
Create `app/schemas/` files:
- `station.py`:
  - `StationBase`: code, name, state
  - `StationDetail`: + location (GeoJSON Point), zone, division, lines, trains count
  - `StationGeoJSON`: for map rendering
- `train.py`:
  - `TrainSummary`: number, name, type, source, destination, runs_on
  - `TrainDetail`: + classes, distance, duration
  - `TrainWithRoute`: + route_geometry (GeoJSON)
- `timetable_stop.py`:
  - `TimetableStop`: stop_number, station_code, station_name, arrival, departure, halt_minutes, distance, day_offset
- `zone.py`, `division.py`: summary and detail variants
- `search.py`: `SearchResult` with type field (`'train'` or `'station'`)

**Note on GeoJSON serialisation:** GeoAlchemy2 returns geometries as WKB. Use `shapely.wkb.loads()` then `shapely.geometry.mapping()` to convert to GeoJSON dict in Pydantic validators.

**Acceptance Criteria:**
- All schemas importable
- Schemas correctly serialise SQLAlchemy model instances to JSON

---

### Task 3.3 — Stations API Endpoints

**Description:** Implement REST endpoints for station data.

**Endpoints:**
```
GET  /api/stations                    — list stations (paginated, filterable by zone/division/state)
GET  /api/stations/{code}             — station detail
GET  /api/stations/{code}/trains      — trains serving this station (paginated)
GET  /api/stations/{code}/lines       — railway lines through this station
GET  /api/stations/geojson            — all stations as GeoJSON FeatureCollection (for map)
```

**Steps:**
1. Create `app/api/stations.py` with an `APIRouter`
2. Implement CRUD functions in `app/crud/stations.py`
3. For `/geojson`, return stations as GeoJSON with properties: code, name, zone, is_junction
4. For pagination, use `?page=1&limit=50` query params
5. Register router in `main.py` with prefix `/api/stations`

**Acceptance Criteria:**
- All endpoints return correct data
- `/api/stations/TVC` returns Thiruvananthapuram Central with zone SR
- `/api/stations/TVC/trains` returns a list of trains stopping at TVC
- `/api/stations/geojson` returns valid GeoJSON

---

### Task 3.4 — Trains API Endpoints

**Description:** Implement REST endpoints for train data.

**Endpoints:**
```
GET  /api/trains                      — list trains (paginated)
GET  /api/trains/{number}             — train detail with route geometry
GET  /api/trains/{number}/timetable   — full ordered timetable
GET  /api/trains/{number}/geojson     — route as GeoJSON LineString
```

**Steps:**
1. Create `app/api/trains.py`
2. The `/timetable` endpoint should return stops ordered by `stop_number`
3. For `/geojson`, return route_geometry as GeoJSON Feature
4. Include `runs_on` as a human-readable array: `["Monday", "Friday"]`

**Acceptance Criteria:**
- `/api/trains/12625` returns Kerala Express details
- `/api/trains/12625/timetable` returns all stops with times
- `/api/trains/12625/geojson` returns valid GeoJSON LineString

---

### Task 3.5 — Search API Endpoint

**Description:** Unified search across trains and stations.

**Endpoints:**
```
GET  /api/search?q={query}            — search trains and stations
GET  /api/search/trains?q={query}     — search trains only
GET  /api/search/stations?q={query}   — search stations only
```

**Steps:**
1. Create `app/api/search.py`
2. Search logic:
   - If query is numeric (e.g., "12625"), match train numbers first
   - Otherwise, do case-insensitive ILIKE search on `trains.name`, `trains.train_number`, `stations.name`, `stations.code`, `stations.name_aliases`
   - Use PostgreSQL full-text search for better relevance: `to_tsvector('english', name) @@ plainto_tsquery('english', query)`
3. Return mixed results with a `type` field and limit to 20 results
4. Add `pg_trgm` extension for fuzzy matching: `CREATE EXTENSION pg_trgm;`

**Acceptance Criteria:**
- `GET /api/search?q=kerala` returns Kerala Express and other matching trains/stations
- `GET /api/search?q=TVC` returns Thiruvananthapuram Central
- `GET /api/search?q=12625` returns Kerala Express

---

### Task 3.6 — Zones & Divisions API Endpoints

**Description:** Endpoints for the administrative hierarchy.

**Endpoints:**
```
GET  /api/zones                       — list all zones
GET  /api/zones/{code}                — zone detail with divisions list
GET  /api/zones/{code}/trains         — trains owned by this zone
GET  /api/divisions                   — list all divisions
GET  /api/divisions/{code}            — division detail with stations list
```

**Acceptance Criteria:**
- `/api/zones/SR` returns Southern Railway with its divisions
- `/api/divisions/TVC` returns Thiruvananthapuram Division with stations

---

### Task 3.7 — Services Between Two Stations

**Description:** Find all trains running between two given stations.

**Endpoint:**
```
GET  /api/services?from={code}&to={code}
```

**Logic:**
1. Find all `train_id`s where a stop with `station_code = from_code` has `stop_number < X` AND a stop with `station_code = to_code` has `stop_number = X` (i.e., `from` comes before `to` in the timetable)
2. SQL:
   ```sql
   SELECT DISTINCT t.*
   FROM trains t
   JOIN timetable_stops s1 ON s1.train_id = t.id AND s1.station_code = :from
   JOIN timetable_stops s2 ON s2.train_id = t.id AND s2.station_code = :to
   WHERE s1.stop_number < s2.stop_number;
   ```
3. Return train summaries with the relevant segment's departure and arrival time

**Acceptance Criteria:**
- `GET /api/services?from=TVC&to=ERS` returns trains running TVC → ERS
- Results include departure/arrival times for those specific stations

---

### Task 3.8 — API Documentation & Error Handling

**Description:** Ensure API is well-documented and returns consistent error responses.

**Steps:**
1. Add `tags`, `summary`, and `description` to all route decorators (FastAPI auto-generates OpenAPI docs)
2. Create `app/core/exceptions.py` with custom exception classes:
   - `NotFoundException(404)` — resource not found
   - `ValidationException(422)` — invalid input
3. Add exception handlers in `main.py`
4. Standardise error response format: `{"error": "Not found", "detail": "Train 99999 does not exist"}`
5. Verify Swagger UI at `http://localhost:8000/docs`

**Acceptance Criteria:**
- `/docs` shows all endpoints with descriptions
- Non-existent resources return 404 with a clear message, not a 500

---

## Phase 4: Frontend Foundation

### Task 4.1 — Routing Structure

**Description:** Define all application routes using React Router.

**Routes:**
```
/                          — Home (map view)
/trains                    — Train list/search page
/trains/:number            — Train detail page
/stations                  — Station list/search page
/stations/:code            — Station detail page
/zones                     — Zones list
/zones/:code               — Zone detail page
/divisions/:code           — Division detail page
/services?from=X&to=Y      — Services between two stations
```

**Steps:**
1. Set up `createBrowserRouter` in `src/router.tsx`
2. Create placeholder page components in `src/pages/`
3. Create `src/components/layout/AppLayout.tsx` — sidebar + main content area
4. Create `src/components/layout/Navbar.tsx` — top navigation with search bar
5. Create `src/components/layout/Sidebar.tsx` — collapsible left sidebar

**Acceptance Criteria:**
- All routes render their placeholder pages without errors
- Navigation between routes works correctly

---

### Task 4.2 — API Service Layer

**Description:** Create typed API service functions for all backend endpoints.

**Steps:**
1. Create `src/services/api.ts` — configure Axios instance with base URL and interceptors
2. Create service files:
   - `src/services/trains.ts` — `getTrains()`, `getTrain(number)`, `getTrainTimetable(number)`, `getTrainGeoJSON(number)`
   - `src/services/stations.ts` — `getStations()`, `getStation(code)`, `getStationTrains(code)`, `getStationsGeoJSON()`
   - `src/services/search.ts` — `search(query)`, `searchTrains(query)`, `searchStations(query)`
   - `src/services/zones.ts` — `getZones()`, `getZone(code)`
   - `src/services/services.ts` — `getServicesBetween(from, to)`
3. All functions return typed responses using the TypeScript interfaces from `src/types/`

**Steps for `src/types/`:**
- `station.ts` — `Station`, `StationDetail`, `StationGeoJSON` interfaces
- `train.ts` — `Train`, `TrainDetail`, `Timetable`, `TimetableStop` interfaces
- `zone.ts` — `Zone`, `Division` interfaces
- `search.ts` — `SearchResult` interface

**Acceptance Criteria:**
- All API calls are strongly typed
- TypeScript compiler (`tsc --noEmit`) passes without errors on service files

---

### Task 4.3 — React Query Setup

**Description:** Configure TanStack Query for server state management and caching.

**Steps:**
1. Wrap app in `QueryClientProvider` in `main.tsx`
2. Configure `QueryClient` with:
   - `staleTime: 5 * 60 * 1000` (5 minutes — railway data doesn't change often)
   - `cacheTime: 30 * 60 * 1000` (30 minutes)
3. Create custom query hooks in `src/hooks/`:
   - `useTrains(params)`, `useTrain(number)`, `useTrainTimetable(number)`, `useTrainRoute(number)`
   - `useStations(params)`, `useStation(code)`, `useStationTrains(code)`
   - `useSearch(query)` — debounced by 300ms
   - `useServicesBetween(from, to)`
4. Each hook handles loading, error, and success states

**Acceptance Criteria:**
- Hooks return `{ data, isLoading, error }` correctly
- Data is cached — navigating back to a page doesn't trigger a new network request

---

### Task 4.4 — Global Search Component

**Description:** Build the global search bar that searches trains and stations.

**Steps:**
1. Create `src/components/search/GlobalSearch.tsx`
2. Features:
   - Input field in the navbar
   - Debounce search by 300ms (use `useSearch` hook)
   - Show dropdown with results grouped by type (Trains / Stations)
   - Keyboard navigation (arrow keys, Enter to select, Escape to close)
   - Each result is clickable and navigates to the detail page
   - Loading spinner while fetching
   - "No results found" state
3. Style with Tailwind

**Acceptance Criteria:**
- Typing "Kerala" shows Kerala Express and Kerala-named stations
- Typing "TVC" shows Thiruvananthapuram Central
- Arrow keys navigate results; Enter navigates to the page
- Clicking outside closes the dropdown

---

## Phase 5: Map Integration

### Task 5.1 — MapLibre GL JS Setup

**Description:** Integrate MapLibre GL JS into the React app as the primary map component.

**Steps:**
1. Create `src/components/map/RailwayMap.tsx`
2. Initialise MapLibre with:
   - Base map style (use a free tile server — e.g., OpenFreeMap, MapTiler free tier, or self-hosted)
   - Recommended free style URL: `https://tiles.openfreemap.org/styles/liberty`
   - Initial centre: India centre point `[82.8, 22.5]`, zoom level 5
3. Use `useRef` for the map container and `useEffect` for initialisation and cleanup
4. Expose map instance via a context (`MapContext`) so child components can add layers
5. Handle map resize on window resize
6. Add zoom controls and navigation controls

**Acceptance Criteria:**
- Map renders India with base tiles
- No memory leaks (map is properly cleaned up on component unmount)
- Map context is accessible from child components

---

### Task 5.2 — Station Markers Layer

**Description:** Render all stations as interactive markers on the map.

**Steps:**
1. Fetch station GeoJSON from `/api/stations/geojson`
2. Add a MapLibre source and layer for stations:
   - Source type: `geojson`
   - Layer type: `circle`
   - Style by station type: junctions use larger circles, regular stations smaller
   - Use zoom-dependent sizing (`interpolate` expression)
3. On station click: show a popup with station name, code, and a "View Details" link
4. On hover: change cursor to pointer and show station name tooltip
5. Add station label layer (text) that appears at zoom 8+

**Acceptance Criteria:**
- Kerala stations appear as markers on the map
- Clicking a station shows a popup
- Labels appear at closer zoom levels

---

### Task 5.3 — Train Route Layer

**Description:** When a train is selected, render its route on the map.

**Steps:**
1. Create `src/components/map/TrainRouteLayer.tsx`
2. Accept a `trainNumber` prop
3. Fetch train route GeoJSON from `/api/trains/{number}/geojson`
4. Add a MapLibre source and layer:
   - Layer type: `line`
   - Colour: bright accent colour (e.g., orange `#F97316`)
   - Width: 3px, increases to 5px on hover
   - Dashed line for approximated segments
5. Fit map bounds to the route on load
6. Show stop markers along the route

**Acceptance Criteria:**
- Selecting Kerala Express renders its full TVC–NDLS route
- Route is highlighted distinctly from background railway lines
- Map pans/zooms to fit the route

---

### Task 5.4 — Background Railway Network Layer

**Description:** Render the full railway network as a background layer using vector tiles or GeoJSON.

**Steps:**
1. For prototype: use the track_segments GeoJSON from the database
2. Create `GET /api/map/network` endpoint returning all track segments as GeoJSON
3. Add as a low-opacity grey line layer below station markers
4. For scale (future): use vector tiles (`.pbf` format) via `tippecanoe` — document this in Phase 10

**Acceptance Criteria:**
- Railway lines are visible as faint grey lines on the map
- This layer does not interfere with interactive layers

---

### Task 5.5 — Map Interactivity: Click & Select

**Description:** Implement map click behaviour — clicking a station navigates to or highlights it.

**Steps:**
1. Clicking a station marker on the map:
   - Highlights the station (changes marker colour)
   - Updates the sidebar to show station summary
   - Optionally navigates to `/stations/{code}`
2. Implement a selected station state in the map context
3. If a train route is displayed, clicking a stop on the route shows the stop's timing info in a popup

**Acceptance Criteria:**
- Map interactions feel responsive and intuitive
- Selected station is visually distinguished

---

## Phase 6: Train Features

### Task 6.1 — Train List Page

**Description:** Build the trains listing page with search and filters.

**Steps:**
1. `src/pages/TrainsPage.tsx`
2. Features:
   - Search input (debounced)
   - Filter by train type (Express, Superfast, Passenger, etc.)
   - Filter by zone
   - Filter by days of operation
   - Paginated list of train cards
3. Train card shows: number, name, type badge, source → destination, operating days
4. Clicking a card navigates to `/trains/{number}`

**Acceptance Criteria:**
- Page loads and shows all prototype trains
- Search for "Kerala" filters to matching trains
- Pagination works

---

### Task 6.2 — Train Detail Page

**Description:** Build the comprehensive train detail page.

**Steps:**
1. `src/pages/TrainDetailPage.tsx`
2. Layout:
   - Header: train number, name, type badge, source → destination
   - Operating days visual (Mon–Sun grid with highlights)
   - Classes available (1A, 2A, 3A, SL, CC badges)
   - Total distance and duration
   - Zone badge
3. Timetable section:
   - Table with columns: Stop#, Station Name, Station Code, Arrival, Departure, Halt (mins), Distance (km), Day
   - Highlight source station (green), destination station (red), intermediate stops (white)
   - Day offset indicator (e.g., "Day 2" label when overnight)
4. Map section:
   - Embedded mini-map showing the train's route
   - Stop markers on the route
5. Related section:
   - Link to zone page
   - Link to each major station's detail page

**Acceptance Criteria:**
- `/trains/12625` shows Kerala Express with full timetable
- All 57+ stops displayed correctly with times
- Day 2 stops (after midnight) labelled correctly
- Mini-map shows the route

---

## Phase 7: Station Features

### Task 7.1 — Station Detail Page

**Description:** Build the station detail page.

**Steps:**
1. `src/pages/StationDetailPage.tsx`
2. Layout:
   - Header: station name, code badge, state
   - Info grid: Zone, Division, Coordinates, Elevation, Platforms, Junction/Terminus badge
   - Railway lines passing through (clickable)
   - Map: station location with zoom level 12, nearby stations visible
3. Trains section:
   - Tabbed: All Trains / Arrivals / Departures / Passing Through
   - Each train row: number, name, type, arrival time, departure time, halt, towards (next major station)
   - Paginated if many trains

**Acceptance Criteria:**
- `/stations/TVC` shows Thiruvananthapuram Central with correct info
- Trains section lists all trains stopping at TVC with times
- Map shows correct location

---

### Task 7.2 — Station List Page

**Description:** Build the stations listing page with filters.

**Steps:**
1. `src/pages/StationsPage.tsx`
2. Features:
   - Search by name or code
   - Filter by state, zone, division
   - Toggle: Show junctions only
   - List/grid view of station cards
3. Station card: code badge, name, zone, division, state

**Acceptance Criteria:**
- Searching "Ernakulam" returns ERS and ERN (Ernakulam Town)
- Zone filter correctly narrows results

---

## Phase 8: Railway Administration Features

### Task 8.1 — Zones Page

**Description:** Build the railway zones overview page.

**Steps:**
1. `src/pages/ZonesPage.tsx` — list all 18 zones with name, code, HQ city
2. `src/pages/ZoneDetailPage.tsx`:
   - Zone name, code, HQ station
   - Map showing the zone's geographic extent (approximate)
   - List of divisions
   - Notable trains
   - Link to official website

**Acceptance Criteria:**
- All 18 zones listed
- `/zones/SR` shows Southern Railway with TVC, Palakkad, Salem, Chennai, Madurai divisions

---

### Task 8.2 — Division Detail Page

**Description:** Build the division detail page.

**Steps:**
1. `src/pages/DivisionDetailPage.tsx`
2. Shows: division name, parent zone, HQ station, list of stations in the division, list of trains

**Acceptance Criteria:**
- `/divisions/TVC` shows Thiruvananthapuram Division under SR with its stations

---

## Phase 9: Search & Discovery

### Task 9.1 — Services Between Two Stations Feature

**Description:** Build the UI for finding services between two stations.

**Steps:**
1. Create `src/pages/ServicesPage.tsx`
2. UI: Two station search/autocomplete inputs (From / To) + Search button
3. Results: list of trains with departure time at `from`, arrival time at `to`, duration, classes
4. Map: show both stations highlighted and a corridor between them
5. Station autocomplete: as user types, show matching stations using `/api/search/stations?q=`

**Acceptance Criteria:**
- Searching TVC → ERS returns trains running that corridor
- Each result shows journey-specific departure and arrival times

---

### Task 9.2 — Trains Through a Station Feature

**Description:** On the station detail page, allow filtering trains by direction.

**Steps:**
1. Already partially covered in Task 7.1 (Arrivals/Departures tabs)
2. Add: "Towards North" / "Towards South" directional filter (based on stop sequence geography)
3. Add: Time-of-day filter (Morning/Afternoon/Evening/Night)

**Acceptance Criteria:**
- Station detail page supports filtering by direction and time of day

---

## Phase 10: Performance & Scalability

### Task 10.1 — Database Indexing Audit

**Description:** Review and optimise all database indexes.

**Steps:**
1. Run `EXPLAIN ANALYZE` on all common queries (station search, timetable fetch, services between)
2. Add missing indexes identified from query plans
3. Ensure all foreign keys have indexes
4. Add composite indexes where beneficial:
   - `(train_id, stop_number)` on timetable_stops (already covered in schema)
   - `(station_code)` on timetable_stops
5. Consider partial indexes: e.g., `CREATE INDEX ON stations(code) WHERE is_junction = TRUE;`

**Acceptance Criteria:**
- All API endpoints respond in under 100ms for typical queries (measure with `time curl ...`)
- No sequential scans on large tables (verify with EXPLAIN ANALYZE)

---

### Task 10.2 — API Response Caching

**Description:** Add caching for expensive or frequently requested responses.

**Steps:**
1. Install `fastapi-cache2` with Redis backend, or use simple in-memory caching with `cachetools`
2. For prototype, use in-memory cache (Redis for production)
3. Cache the following responses:
   - `/api/stations/geojson` — cache for 1 hour (changes infrequently)
   - `/api/map/network` — cache for 1 hour
   - `/api/trains/{number}/geojson` — cache for 30 minutes
   - `/api/zones`, `/api/divisions` — cache for 24 hours
4. Add `Cache-Control` headers to cached responses

**Acceptance Criteria:**
- Second request to `/api/stations/geojson` is served from cache (verify via response headers or logs)
- Cache invalidates correctly after data pipeline runs

---

### Task 10.3 — Vector Tiles for Map Data (Future Scaling)

**Description:** Plan and document the migration from GeoJSON to vector tiles for large-scale map data.

**Steps:**
1. Install `tippecanoe` (Mapbox tool for generating vector tile sets)
2. Generate `.mbtiles` from the full railway network GeoJSON:
   ```bash
   tippecanoe -o railway_network.mbtiles -z14 -Z4 --drop-densest-as-needed railway_segments.geojson
   ```
3. Serve vector tiles using `martin` (Rust-based tile server) or `pg_tileserv`
4. Update MapLibre source type from `geojson` to `vector` pointing to the tile server
5. Document this process in `docs/vector-tiles.md`

**Note:** This task is critical for nationwide scaling. A GeoJSON of India's full railway network is ~50MB+ — vector tiles load only what's in the viewport.

**Acceptance Criteria:**
- Vector tiles serve correctly and map loads railway data at appropriate zoom levels
- Performance improvement documented with before/after load times

---

### Task 10.4 — Pagination & Infinite Scroll

**Description:** Ensure all list endpoints and pages support efficient pagination.

**Steps:**
1. All list API endpoints use cursor-based or offset pagination: `?page=1&limit=50`
2. Frontend list pages use "Load More" or infinite scroll via React Query's `useInfiniteQuery`
3. Total count returned in response headers: `X-Total-Count: 500`

**Acceptance Criteria:**
- Large lists (stations, trains) don't load all records at once
- "Load More" button works without resetting scroll position

---

## Phase 11: Data Quality & Validation

### Task 11.1 — Timetable Versioning

**Description:** Add versioning support to timetables so updates don't break existing data.

**Steps:**
1. Add columns to `trains` and `timetable_stops`:
   - `effective_from DATE` — when this timetable became active
   - `effective_until DATE` — when it was superseded (NULL = current)
2. When updating a timetable, mark old records as superseded rather than deleting
3. API always returns `WHERE effective_until IS NULL` by default
4. Document how to update timetables when Indian Railways releases new schedules (typically twice a year)

**Acceptance Criteria:**
- Old timetable records are preserved after an update
- API returns current timetable correctly

---

### Task 11.2 — Source Attribution Display

**Description:** Show data source and last-verified date to users.

**Steps:**
1. Create `data_sources` table: `id, entity_type, source_name, source_url, license, last_verified_at`
2. Add `data_source_id` FK to stations, trains, track_segments tables
3. On station/train detail pages, show a small "Data Source" section at the bottom
4. Example: "Station data sourced from data.gov.in (Indian Railways) — Last verified: Jan 2024"

**Acceptance Criteria:**
- Users can see where data came from and when it was last verified
- Source attribution appears on all detail pages

---

### Task 11.3 — Data Discrepancy Reporting

**Description:** Allow users to flag potential data errors.

**Steps:**
1. Add a "Report an Issue" button on train/station detail pages
2. Create `data_issues` table: `id, entity_type, entity_id, description, reported_at, status`
3. `POST /api/issues` endpoint to submit a report
4. Admin view (simple — can be a read-only DB query initially) to review reports

**Acceptance Criteria:**
- Users can submit data error reports
- Reports are stored in the database

---

## Phase 12: Regional Expansion

### Task 12.1 — Expand to Tamil Nadu Corridor

**Description:** Add stations, timetables, and track segments for Tamil Nadu.

**Steps:**
1. Re-run station ingestion pipeline filtered for Tamil Nadu
2. Add timetable data for Tamil Nadu trains (Chennai Central–Coimbatore, etc.)
3. Add track geometry for Chennai–Coimbatore and Chennai–Madurai corridors
4. Verify data quality: run validation scripts
5. Update prototype bounding box from Kerala-only to Kerala + Tamil Nadu

**Key new stations:** MAS (Chennai Central), MS (Chennai Egmore), CBE (Coimbatore), MDU (Madurai), TPJ (Tiruchirappalli), ED (Erode), SA (Salem), TEN (Tirunelveli), NCJ (Nagercoil)

**Acceptance Criteria:**
- All major Tamil Nadu stations appear on map
- Services between TVC and MAS return correct trains

---

### Task 12.2 — Expand to Karnataka Corridor

**Steps:**
1. Add Karnataka stations and timetables (especially Bengaluru–Mangaluru–Kozhikode corridor)
2. Key stations: SBC (KSR Bengaluru), YPR (Yeshvanthpur), MAQ (Mangaluru Central), MAJN (Mangaluru Junction)
3. Add Konkan Railway as a separate organisation (`railway_type = 'separate_entity'`)

**Acceptance Criteria:**
- Konkan Railway trains (e.g., 12201 Kudla Express) appear with correct routes

---

### Task 12.3 — Nationwide Data Ingestion Plan

**Description:** Document and automate the full nationwide expansion.

**Steps:**
1. Download the complete Indian Railways station dataset (~8,000+ stations)
2. Download the full timetable dataset (~13,000+ train services)
3. Run the full ingestion pipeline — this may take hours
4. Monitor import_runs table for errors
5. Fix data quality issues found during nationwide ingestion
6. Update bounding box logic from region-based to full India
7. Switch map to vector tiles (Task 10.3) — required at this scale

**Acceptance Criteria:**
- All 8,000+ stations loaded with coordinates
- All major express/superfast trains have timetables
- Map loads without performance degradation

---

## Phase 13: Testing & QA

### Task 13.1 — Backend Unit Tests

**Description:** Write unit tests for CRUD functions and schemas.

**Steps:**
1. Install `pytest`, `pytest-asyncio`, `httpx`
2. Create `backend/tests/` directory
3. Write tests:
   - `test_stations.py` — CRUD operations, GeoJSON serialisation
   - `test_trains.py` — timetable ordering, day offset calculation
   - `test_search.py` — search returns correct results
   - `test_services.py` — services between stations logic
4. Use a separate test database (or PostgreSQL transactions that rollback)
5. Run with: `pytest backend/tests/ -v`

**Acceptance Criteria:**
- All tests pass
- Core business logic (day offset, stop ordering, services-between query) has test coverage

---

### Task 13.2 — Backend Integration Tests

**Description:** Test API endpoints end-to-end using the HTTP client.

**Steps:**
1. Use `httpx.AsyncClient` with the FastAPI test client
2. Write integration tests for all major endpoints
3. Test edge cases: non-existent train number (expect 404), invalid station code, empty search query

**Acceptance Criteria:**
- All endpoints tested
- Error cases return correct HTTP status codes

---

### Task 13.3 — Frontend Component Tests

**Description:** Write tests for key React components.

**Steps:**
1. Install `vitest`, `@testing-library/react`, `@testing-library/user-event`, `msw` (Mock Service Worker)
2. Set up MSW handlers mocking the API
3. Write tests:
   - `GlobalSearch.test.tsx` — typing triggers search, results appear, keyboard nav works
   - `TimetableTable.test.tsx` — renders stops in order, day offsets shown correctly
   - `TrainCard.test.tsx` — renders train info correctly
4. Run with: `npm run test`

**Acceptance Criteria:**
- All component tests pass
- MSW intercepts API calls so tests don't need a live backend

---

### Task 13.4 — Data Pipeline Validation Tests

**Description:** Write tests for pipeline data cleaning and transformation logic.

**Steps:**
1. In `pipeline/tests/`, write unit tests for:
   - `test_day_offset.py` — verify overnight trains get correct day offsets
   - `test_station_validation.py` — invalid coordinates rejected
   - `test_timetable_sequence.py` — non-monotonic stop sequences detected
2. Use small fixture CSV files as test data

**Acceptance Criteria:**
- All pipeline logic tests pass
- Invalid data is correctly detected and rejected

---

## Phase 14: Deployment & DevOps

### Task 14.1 — Production Docker Setup

**Description:** Create Docker images for frontend and backend.

**Steps:**
1. `frontend/Dockerfile`:
   - Build stage: `node:20-alpine`, run `npm ci && npm run build`
   - Serve stage: `nginx:alpine`, copy `dist/` and serve
2. `backend/Dockerfile`:
   - `python:3.12-slim`, install requirements, run `uvicorn`
3. Update `docker-compose.yml` to include:
   - `frontend` service (nginx, port 80)
   - `backend` service (uvicorn, port 8000)
   - `db` service (postgis, port 5432)
4. Add `nginx.conf` for the frontend container to proxy `/api/` to the backend

**Acceptance Criteria:**
- `docker compose up --build` starts the full stack
- Frontend served on port 80 can reach the backend API

---

### Task 14.2 — Environment Variable Management

**Description:** Ensure all sensitive config is managed through environment variables.

**Steps:**
1. Document all required environment variables in `README.md` and `.env.example`
2. Backend vars: `DATABASE_URL`, `ALLOWED_ORIGINS`, `DEBUG`, `CACHE_TTL`
3. Frontend vars: `VITE_API_BASE_URL`, `VITE_MAP_STYLE_URL`, `VITE_MAP_API_KEY` (if using a commercial tile provider)
4. Never commit `.env` files

**Acceptance Criteria:**
- App works by setting the documented env vars
- No secrets hardcoded anywhere

---

### Task 14.3 — CI/CD Pipeline (GitHub Actions)

**Description:** Set up automated testing on pull requests.

**Steps:**
1. Create `.github/workflows/ci.yml`
2. Jobs:
   - `test-backend`: Set up Python, install deps, run pytest
   - `test-frontend`: Set up Node, install deps, run vitest
   - `lint`: Run `ruff` (Python linting) and `eslint` (TypeScript linting)
3. Run on `push` to `main` and on all pull requests

**Acceptance Criteria:**
- CI runs automatically on every push and PR
- Failing tests block PR merges

---

## Appendix: Data Sources

| Source | URL | License | Data Type |
|--------|-----|---------|-----------|
| data.gov.in — Indian Railways Stations | https://data.gov.in | Government Open Data | Station list, codes, coordinates |
| data.gov.in — Train Timetables | https://data.gov.in | Government Open Data | Train schedules, stops, times |
| OpenStreetMap (Geofabrik India) | https://download.geofabrik.de/asia/india.html | ODbL | Railway track geometries |
| OSM Overpass API | https://overpass-api.de | ODbL | Ad-hoc OSM queries |
| NTES (National Train Enquiry System) | https://enquiry.indianrail.gov.in | Public access | Train running info |
| OpenFreeMap | https://openfreemap.org | ODbL | Map base tiles (free) |

> **Always verify licensing before using any dataset commercially or redistributing it.**

---

## Appendix: Architectural Decisions

### Why PostgreSQL + PostGIS?
PostGIS enables native spatial queries — finding stations within a radius, computing route lengths, spatial intersections — all in SQL without needing a separate geospatial service. It is the industry standard for geospatial data storage.

### Why MapLibre GL JS over Leaflet?
MapLibre supports WebGL-accelerated rendering (handles 10,000+ points without lag), vector tile support (critical for nationwide scaling), and smooth zoom/pan animations. Leaflet is simpler but not suited for this scale.

### Why async FastAPI?
Railway data involves complex joins (trains × stops × stations). Async SQLAlchemy with `asyncpg` allows the server to handle multiple concurrent requests without blocking on slow DB queries.

### Why TanStack Query over Redux?
Railway data is server-sourced and rarely mutated from the client. TanStack Query handles caching, refetching, and synchronisation without the boilerplate of Redux.

### Day Offset in Timetables
Indian Railways timetables publish all times in a single column with no midnight indicator. A train departing Monday at 22:00 and arriving Tuesday at 06:00 shows `06:00` for the arrival — which is less than the `22:00` departure. The `day_offset` column resolves this ambiguity.

### Scheduled Data Only (No Live Tracking)
The platform displays scheduled information only. Live train positions require integration with NTES APIs which have rate limits, may have ToS restrictions, and introduce real-time data staleness concerns. The platform clearly communicates this to users.

### Regional-First Development
Starting with Kerala allows the team to validate the full stack (data pipeline → DB → API → frontend → map) with a manageable dataset (~50 stations, ~20 trains) before the complexity of nationwide data (8,000+ stations, 13,000+ trains).

---

*Last updated: Project inception. Update this document as architectural decisions evolve.*
