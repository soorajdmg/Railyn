"""
Timetable loader — reads train schedule CSV from data.gov.in.

Expected CSV columns:
    train_no, train_name, islno (stop_number), station_code, station_name,
    arrival, departure, distance, source_station_code, dest_station_code

Usage:
    python -m pipeline.loaders.load_timetables --file raw_data/timetable.csv
"""
import argparse
import logging

import pandas as pd

from pipeline.utils.db import get_connection, log_import_run
from pipeline.utils.geo import compute_day_offsets

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def parse_time(t):
    if pd.isna(t) or str(t).strip() in ('', '--', 'SOURCE', 'DEST'):
        return None
    t = str(t).strip()
    if len(t) == 4:
        return f"{t[:2]}:{t[2:]}"
    return t[:5]  # HH:MM


def load_timetables(filepath: str, dry_run: bool = False):
    logger.info(f"Loading timetables from {filepath}")
    df = pd.read_csv(filepath)
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    if dry_run:
        logger.info(f"DRY RUN: {len(df)} rows in {filepath}")
        return

    conn = get_connection()
    cur = conn.cursor()

    # Valid station codes
    cur.execute("SELECT code FROM stations")
    valid_stations = {row[0] for row in cur.fetchall()}

    # Zone map
    cur.execute("SELECT code, id FROM zones")
    zone_map = {r[0]: r[1] for r in cur.fetchall()}

    trains_inserted = stops_inserted = warnings = 0

    # Group by train number
    for train_no, group in df.groupby('train_no'):
        train_no = str(train_no).strip().zfill(5)
        group = group.sort_values('islno')

        first_row = group.iloc[0]
        name = str(first_row.get('train_name', train_no)).strip()
        src = str(first_row.get('source_station_code', '')).strip().upper()
        dst = str(first_row.get('dest_station_code', '')).strip().upper()
        zone_code = str(first_row.get('zone', '')).strip().upper()
        zone_id = zone_map.get(zone_code)

        # Upsert train
        cur.execute("""
            INSERT INTO trains (train_number, name, source_station_code,
                destination_station_code, zone_id)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (train_number) DO UPDATE SET name=EXCLUDED.name
            RETURNING id
        """, (train_no, name, src or None, dst or None, zone_id))
        train_id = cur.fetchone()[0]
        trains_inserted += 1

        # Build stops list
        stops = []
        for _, row in group.iterrows():
            code = str(row.get('station_code', '')).strip().upper()
            if code not in valid_stations:
                warnings += 1
                continue
            stops.append({
                'stop_number': int(row['islno']),
                'station_code': code,
                'arrival_time': parse_time(row.get('arrival')),
                'departure_time': parse_time(row.get('departure')),
                'distance_from_origin_km': float(row['distance']) if pd.notna(row.get('distance')) else None,
                'day_offset': 0,
            })

        if not stops:
            continue

        stops = compute_day_offsets(stops)

        # Delete old stops for this train
        cur.execute("DELETE FROM timetable_stops WHERE train_id = %s", (train_id,))

        for stop in stops:
            halt = None
            if stop['arrival_time'] and stop['departure_time']:
                from datetime import datetime
                fmt = "%H:%M"
                try:
                    a = datetime.strptime(stop['arrival_time'], fmt)
                    d = datetime.strptime(stop['departure_time'], fmt)
                    diff = (d - a).total_seconds() / 60
                    if diff < 0:
                        diff += 1440
                    halt = int(diff)
                except ValueError:
                    pass

            cur.execute("""
                INSERT INTO timetable_stops
                    (train_id, station_code, stop_number, arrival_time, departure_time,
                     halt_minutes, distance_from_origin_km, day_offset)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT ON CONSTRAINT uq_train_stop_number DO UPDATE SET
                    station_code=EXCLUDED.station_code,
                    arrival_time=EXCLUDED.arrival_time,
                    departure_time=EXCLUDED.departure_time,
                    halt_minutes=EXCLUDED.halt_minutes,
                    distance_from_origin_km=EXCLUDED.distance_from_origin_km,
                    day_offset=EXCLUDED.day_offset
            """, (train_id, stop['station_code'], stop['stop_number'],
                  stop['arrival_time'], stop['departure_time'],
                  halt, stop['distance_from_origin_km'], stop['day_offset']))
            stops_inserted += 1

        conn.commit()

    cur.close()
    log_import_run(conn, filepath, 'timetables', len(df), trains_inserted, 0, 0, warnings)
    conn.close()
    logger.info(f"Done: trains={trains_inserted}, stops={stops_inserted}, warnings={warnings}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    load_timetables(args.file, args.dry_run)
