"""
Pipeline orchestrator.

Usage:
    python pipeline/run.py --dry-run
    python pipeline/run.py --stations raw_data/stations.csv
    python pipeline/run.py --timetables raw_data/timetable.csv
    python pipeline/run.py --compute-routes
"""
import argparse
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Railyn data pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to DB")
    parser.add_argument("--stations", metavar="FILE", help="Load stations from CSV")
    parser.add_argument("--timetables", metavar="FILE", help="Load timetables from CSV")
    parser.add_argument("--compute-routes", action="store_true", help="Compute train route geometries")
    args = parser.parse_args()

    if args.dry_run and not any([args.stations, args.timetables, args.compute_routes]):
        logger.info("Dry run: testing database connection...")
        try:
            from pipeline.utils.db import get_connection
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM stations")
            count = cur.fetchone()[0]
            cur.close()
            conn.close()
            logger.info(f"Database OK. Station count: {count}")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            sys.exit(1)
        return

    if args.stations:
        from pipeline.loaders.load_stations import load_stations
        load_stations(args.stations, dry_run=args.dry_run)

    if args.timetables:
        from pipeline.loaders.load_timetables import load_timetables
        load_timetables(args.timetables, dry_run=args.dry_run)

    if args.compute_routes:
        from pipeline.loaders.compute_route_geometries import compute_route_geometries
        compute_route_geometries()

    logger.info("Pipeline complete.")


if __name__ == "__main__":
    main()
