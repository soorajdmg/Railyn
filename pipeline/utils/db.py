import psycopg2
from urllib.parse import urlparse
from pipeline.config import SYNC_DATABASE_URL


def get_connection():
    """Get a psycopg2 connection to the database."""
    parsed = urlparse(SYNC_DATABASE_URL)
    return psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        dbname=parsed.path.lstrip('/'),
        user=parsed.username,
        password=parsed.password,
    )


def log_import_run(conn, source_name, entity_type, total, inserted, updated, skipped, errors, error_log=""):
    """Log an import run to the import_runs table."""
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO import_runs
            (source_name, entity_type, records_total, records_inserted,
             records_updated, records_skipped, errors_count, error_log)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (source_name, entity_type, total, inserted, updated, skipped, errors, error_log))
    conn.commit()
    cur.close()
