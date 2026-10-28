"""
Compute precomputed route geometries for all trains using track_segments.
Falls back to straight-line segments when no track segment exists.

Usage:
    python -m pipeline.loaders.compute_route_geometries
"""
import logging

from pipeline.utils.db import get_connection

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def compute_route_geometries():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, train_number FROM trains")
    trains = cur.fetchall()

    updated = fallbacks = 0

    for train_id, train_number in trains:
        cur.execute("""
            SELECT ts.station_code, s.location
            FROM timetable_stops ts
            JOIN stations s ON s.code = ts.station_code
            WHERE ts.train_id = %s AND s.location IS NOT NULL
            ORDER BY ts.stop_number
        """, (train_id,))
        stops = cur.fetchall()

        if len(stops) < 2:
            continue

        # Build route geometry using track_segments where available
        segments = []
        for i in range(len(stops) - 1):
            from_code = stops[i][0]
            to_code = stops[i + 1][0]

            # Try to find a track segment
            cur.execute("""
                SELECT ST_AsText(geometry)
                FROM track_segments
                WHERE from_station_code = %s AND to_station_code = %s
            """, (from_code, to_code))
            seg = cur.fetchone()

            if seg:
                segments.append(seg[0])
            else:
                # Fallback: straight line between stations
                cur.execute("""
                    SELECT ST_AsText(
                        ST_MakeLine(
                            (SELECT location::geometry FROM stations WHERE code = %s),
                            (SELECT location::geometry FROM stations WHERE code = %s)
                        )
                    )
                """, (from_code, to_code))
                line = cur.fetchone()
                if line and line[0]:
                    segments.append(line[0])
                    fallbacks += 1

        if not segments:
            continue

        # Merge all segments into one linestring
        try:
            cur.execute("""
                UPDATE trains
                SET route_geometry = (
                    SELECT ST_LineMerge(ST_Collect(ST_GeomFromText(unnest, 4326)))
                    FROM unnest(%s::text[])
                )
                WHERE id = %s
            """, (segments, train_id))
            updated += 1
        except Exception as e:
            logger.warning(f"Failed to update route for {train_number}: {e}")
            conn.rollback()
            continue

        conn.commit()

    cur.close()
    conn.close()
    logger.info(f"Route geometries computed: {updated} trains, {fallbacks} straight-line fallbacks")


if __name__ == "__main__":
    compute_route_geometries()
