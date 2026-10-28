"""
Station loader — reads a CSV file from data.gov.in or OSM export.

Expected CSV columns (data.gov.in format):
    station_code, station_name, state_name, zone_name, address, lat, long

Usage:
    python -m pipeline.loaders.load_stations --file raw_data/stations.csv
"""
import argparse
import logging
import sys

import pandas as pd

from pipeline.utils.db import get_connection, log_import_run
from pipeline.utils.geo import validate_india_bbox

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def load_stations(filepath: str, dry_run: bool = False):
    logger.info(f"Loading stations from {filepath}")
    df = pd.read_csv(filepath)

    # Normalise column names
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # Try to find the right columns
    code_col = next((c for c in df.columns if 'code' in c or 'stn' in c), None)
    name_col = next((c for c in df.columns if 'name' in c and 'state' not in c), None)
    lat_col = next((c for c in df.columns if 'lat' in c), None)
    lon_col = next((c for c in df.columns if 'long' in c or 'lon' in c), None)
    state_col = next((c for c in df.columns if 'state' in c), None)
    zone_col = next((c for c in df.columns if 'zone' in c), None)

    if not all([code_col, name_col]):
        logger.error(f"Could not identify required columns. Found: {list(df.columns)}")
        sys.exit(1)

    logger.info(f"Columns: code={code_col}, name={name_col}, lat={lat_col}, lon={lon_col}")

    total = len(df)
    inserted = updated = skipped = errors = 0
    error_msgs = []

    if dry_run:
        logger.info(f"DRY RUN: Would process {total} rows")
        return

    conn = get_connection()
    cur = conn.cursor()

    # Build zone and division maps
    cur.execute("SELECT code, id FROM zones")
    zone_map = {row[0]: row[1] for row in cur.fetchall()}

    for _, row in df.iterrows():
        code = str(row[code_col]).strip().upper()

        # Validate code
        if not (2 <= len(code) <= 7 and code.isalpha()):
            skipped += 1
            continue

        name = str(row.get(name_col, '')).strip()
        if not name:
            skipped += 1
            continue

        state = str(row.get(state_col, '')).strip() if state_col else None
        zone_code = str(row.get(zone_col, '')).strip().upper() if zone_col else None
        zone_id = zone_map.get(zone_code) if zone_code else None

        lat = lon = None
        if lat_col and lon_col:
            try:
                lat = float(row[lat_col])
                lon = float(row[lon_col])
                if not validate_india_bbox(lat, lon):
                    lat = lon = None
            except (ValueError, TypeError):
                lat = lon = None

        try:
            if lat and lon:
                cur.execute("""
                    INSERT INTO stations (name, code, state, zone_id, location)
                    VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography)
                    ON CONFLICT (code) DO UPDATE SET
                        name=EXCLUDED.name, state=EXCLUDED.state,
                        zone_id=COALESCE(EXCLUDED.zone_id, stations.zone_id),
                        location=COALESCE(EXCLUDED.location, stations.location)
                """, (name, code, state, zone_id, lon, lat))
            else:
                cur.execute("""
                    INSERT INTO stations (name, code, state, zone_id)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (code) DO UPDATE SET
                        name=EXCLUDED.name, state=EXCLUDED.state
                """, (name, code, state, zone_id))

            if cur.rowcount > 0:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            errors += 1
            error_msgs.append(f"{code}: {e}")
            conn.rollback()
            continue

    conn.commit()
    cur.close()

    log_import_run(conn, filepath, 'stations', total, inserted, updated, skipped, errors,
                   '\n'.join(error_msgs[:50]))
    conn.close()

    logger.info(f"Done: total={total}, inserted={inserted}, updated={updated}, "
                f"skipped={skipped}, errors={errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    load_stations(args.file, args.dry_run)
