import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://railyn_user:railyn_pass@localhost:5432/railyn"
)

# Sync URL for psycopg2 (used in pipeline)
SYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql://"
).replace("postgresql+psycopg2://", "postgresql://")

# Bounding boxes
KERALA_BBOX = [74.8, 8.2, 77.5, 12.8]  # [min_lon, min_lat, max_lon, max_lat]
INDIA_BBOX = [68.1, 6.7, 97.4, 35.7]
