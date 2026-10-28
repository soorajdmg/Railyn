"""
Seed script for Kerala prototype data.
Run from the backend directory:
    python ../db/seeds/seed_kerala.py

Requires DATABASE_URL in backend/.env or environment.
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))

import psycopg2
from urllib.parse import urlparse

# Get sync URL
db_url = os.environ.get("DATABASE_URL", "postgresql+asyncpg://railyn_user:railyn_pass@localhost:5432/railyn")
sync_url = db_url.replace("postgresql+asyncpg://", "postgresql://").replace("postgresql+psycopg2://", "postgresql://")
parsed = urlparse(sync_url)

conn = psycopg2.connect(
    host=parsed.hostname,
    port=parsed.port or 5432,
    dbname=parsed.path.lstrip('/'),
    user=parsed.username,
    password=parsed.password,
)
conn.autocommit = False
cur = conn.cursor()

print("Connected to database. Starting seed...")

# ============================================================
# ZONES
# ============================================================
zones = [
    ("Central Railway", "CR", "Mumbai"),
    ("Eastern Railway", "ER", "Kolkata"),
    ("East Central Railway", "ECR", "Hajipur"),
    ("East Coast Railway", "ECoR", "Bhubaneswar"),
    ("Northern Railway", "NR", "New Delhi"),
    ("North Central Railway", "NCR", "Allahabad"),
    ("North Eastern Railway", "NER", "Gorakhpur"),
    ("Northeast Frontier Railway", "NFR", "Guwahati"),
    ("North Western Railway", "NWR", "Jaipur"),
    ("Southern Railway", "SR", "Chennai"),
    ("South Central Railway", "SCR", "Secunderabad"),
    ("South Eastern Railway", "SER", "Kolkata"),
    ("South East Central Railway", "SECR", "Bilaspur"),
    ("South Western Railway", "SWR", "Hubballi"),
    ("Western Railway", "WR", "Mumbai"),
    ("West Central Railway", "WCR", "Jabalpur"),
    ("Kolkata Metro", "Metro", "Kolkata"),
    ("Konkan Railway", "KR", "Navi Mumbai"),
]

print("Inserting zones...")
for name, code, hq in zones:
    cur.execute("""
        INSERT INTO zones (name, code, hq_city)
        VALUES (%s, %s, %s)
        ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, hq_city=EXCLUDED.hq_city
    """, (name, code, hq))

conn.commit()
print(f"  Inserted {len(zones)} zones")

# Get SR zone id
cur.execute("SELECT id FROM zones WHERE code = 'SR'")
sr_id = cur.fetchone()[0]

# ============================================================
# DIVISIONS (Southern Railway)
# ============================================================
divisions = [
    ("Thiruvananthapuram Division", "TVC", sr_id, "Thiruvananthapuram"),
    ("Palakkad Division", "PGT", sr_id, "Palakkad"),
    ("Salem Division", "SA", sr_id, "Salem"),
    ("Chennai Division", "MAS", sr_id, "Chennai"),
    ("Madurai Division", "MDU", sr_id, "Madurai"),
    ("Tiruchirappalli Division", "TPJ", sr_id, "Tiruchirappalli"),
]

print("Inserting divisions...")
for name, code, zone_id, hq in divisions:
    cur.execute("""
        INSERT INTO divisions (name, code, zone_id, hq_city)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
    """, (name, code, zone_id, hq))

conn.commit()
print(f"  Inserted {len(divisions)} divisions")

# Get division IDs
cur.execute("SELECT code, id FROM divisions")
div_map = {row[0]: row[1] for row in cur.fetchall()}

# ============================================================
# STATIONS (Kerala + adjoining)
# ============================================================
# Format: (name, code, state, is_junction, is_terminus, platform_count, lat, lon, zone_code, div_code)
stations = [
    # Kerala - TVC Division
    ("Thiruvananthapuram Central", "TVC", "Kerala", True, True, 5, 8.4885, 76.9490, "SR", "TVC"),
    ("Varkala Shivagiri", "VAD", "Kerala", False, False, 2, 8.7354, 76.7160, "SR", "TVC"),
    ("Kollam Junction", "QLN", "Kerala", True, False, 4, 8.8869, 76.5930, "SR", "TVC"),
    ("Alappuzha", "ALLP", "Kerala", False, False, 3, 9.4980, 76.3388, "SR", "TVC"),
    ("Kottayam", "KTYM", "Kerala", False, False, 3, 9.5916, 76.5222, "SR", "TVC"),
    ("Ernakulam Junction", "ERS", "Kerala", True, False, 6, 9.9816, 76.2997, "SR", "TVC"),
    ("Ernakulam Town", "ERN", "Kerala", False, False, 3, 9.9899, 76.2981, "SR", "TVC"),
    ("Aluva", "AWY", "Kerala", False, False, 2, 10.1068, 76.3534, "SR", "TVC"),
    ("Thrissur", "TCR", "Kerala", False, False, 4, 10.5276, 76.2144, "SR", "TVC"),
    ("Shoranur Junction", "SRR", "Kerala", True, False, 5, 10.7661, 76.2830, "SR", "PGT"),
    ("Palakkad Junction", "PGT", "Kerala", True, False, 4, 10.7764, 76.6543, "SR", "PGT"),
    ("Kozhikode", "CLT", "Kerala", False, False, 4, 11.2490, 75.7800, "SR", "PGT"),
    ("Kannur", "CAN", "Kerala", False, False, 3, 11.8745, 75.3704, "SR", "PGT"),
    ("Kanhangad", "KGQ", "Kerala", False, False, 2, 12.3540, 74.9840, "SR", "PGT"),
    ("Kasaragod", "KGD", "Kerala", False, False, 2, 12.4996, 74.9867, "SR", "PGT"),
    # Kanyakumari (Tamil Nadu, TVC div)
    ("Kanyakumari", "KYJ", "Tamil Nadu", False, True, 2, 8.0883, 77.5385, "SR", "TVC"),
    ("Nagercoil Junction", "NCJ", "Tamil Nadu", True, False, 4, 8.1773, 77.4248, "SR", "TVC"),
    # Major external junctions
    ("Chennai Central", "MAS", "Tamil Nadu", True, True, 17, 13.0827, 80.2707, "SR", "MAS"),
    ("Coimbatore Junction", "CBE", "Tamil Nadu", True, False, 7, 11.0018, 76.9628, "SR", "SA"),
    ("Madurai Junction", "MDU", "Tamil Nadu", True, False, 8, 9.9195, 78.1193, "SR", "MDU"),
    ("Tiruchirappalli Junction", "TPJ", "Tamil Nadu", True, False, 8, 10.7905, 78.7047, "SR", "TPJ"),
    ("Salem Junction", "SA", "Tamil Nadu", True, False, 5, 11.6643, 78.1460, "SR", "SA"),
    ("New Delhi", "NDLS", "Delhi", True, True, 16, 28.6417, 77.2194, "NR", None),
    ("Mumbai CST", "CSTM", "Maharashtra", True, True, 18, 18.9399, 72.8352, "CR", None),
    ("Mangaluru Central", "MAQ", "Karnataka", True, False, 4, 12.8698, 74.8422, "SR", None),
    ("Mangaluru Junction", "MAJN", "Karnataka", True, False, 3, 12.9141, 74.8560, "SR", None),
    ("KSR Bengaluru", "SBC", "Karnataka", True, True, 10, 12.9766, 77.5993, "SWR", None),
]

print("Inserting stations...")
inserted = 0
for name, code, state, is_junc, is_term, platforms, lat, lon, zone_code, div_code in stations:
    cur.execute("SELECT id FROM zones WHERE code = %s", (zone_code,))
    row = cur.fetchone()
    zone_id = row[0] if row else None

    div_id = div_map.get(div_code) if div_code else None

    cur.execute("""
        INSERT INTO stations (name, code, state, is_junction, is_terminus, platform_count,
            location, zone_id, division_id)
        VALUES (%s, %s, %s, %s, %s, %s,
            ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, %s, %s)
        ON CONFLICT (code) DO UPDATE SET
            name=EXCLUDED.name, state=EXCLUDED.state,
            is_junction=EXCLUDED.is_junction, is_terminus=EXCLUDED.is_terminus,
            platform_count=EXCLUDED.platform_count, location=EXCLUDED.location,
            zone_id=EXCLUDED.zone_id, division_id=EXCLUDED.division_id
    """, (name, code, state, is_junc, is_term, platforms, lon, lat, zone_id, div_id))
    inserted += 1

conn.commit()
print(f"  Inserted/updated {inserted} stations")

# ============================================================
# RAILWAY LINES
# ============================================================
print("Inserting railway lines...")
cur.execute("""
    INSERT INTO railway_lines (name, code, line_type, gauge, electrified, zone_id)
    VALUES
        ('Kerala Coast Line (TVC–MAQ)', 'KCL', 'mainline', 'BG', false, %s),
        ('Palakkad–Ernakulam Corridor', 'PGT-ERS', 'mainline', 'BG', false, %s),
        ('Shoranur–Mangaluru Line', 'SRR-MAQ', 'mainline', 'BG', false, %s)
    ON CONFLICT DO NOTHING
""", (sr_id, sr_id, sr_id))

conn.commit()

# ============================================================
# TRAINS
# ============================================================
print("Inserting trains...")
trains_data = [
    # (number, name, type, source, dest, distance_km, duration_min, runs_on, classes)
    ("12625", "Kerala Express", "Superfast", "TVC", "NDLS", 3052, 1840,
     [True, True, True, True, True, True, True], ["1A", "2A", "3A", "SL", "2S"]),
    ("12626", "Kerala Express", "Superfast", "NDLS", "TVC", 3052, 1840,
     [True, True, True, True, True, True, True], ["1A", "2A", "3A", "SL", "2S"]),
    ("12431", "Thiruvananthapuram Rajdhani", "Rajdhani", "TVC", "NDLS", 3082, 1560,
     [False, True, False, True, False, True, False], ["1A", "2A", "3A"]),
    ("12432", "Thiruvananthapuram Rajdhani", "Rajdhani", "NDLS", "TVC", 3082, 1560,
     [False, False, True, False, True, False, True], ["1A", "2A", "3A"]),
    ("16301", "Venad Express", "Express", "TVC", "SRR", 305, 345,
     [True, True, True, True, True, True, True], ["2A", "SL", "2S"]),
    ("16302", "Venad Express", "Express", "SRR", "TVC", 305, 345,
     [True, True, True, True, True, True, True], ["2A", "SL", "2S"]),
    ("16345", "Netravati Express", "Express", "TVC", "MAQ", 1051, 1115,
     [True, True, True, True, True, True, True], ["2A", "3A", "SL", "2S"]),
    ("16346", "Netravati Express", "Express", "MAQ", "TVC", 1051, 1115,
     [True, True, True, True, True, True, True], ["2A", "3A", "SL", "2S"]),
    ("22113", "Kerala SF Express", "Superfast", "TVC", "CSTM", 1924, 1440,
     [False, False, True, False, False, True, False], ["1A", "2A", "3A", "SL"]),
    ("22114", "Kerala SF Express", "Superfast", "CSTM", "TVC", 1924, 1440,
     [True, False, False, True, False, False, True], ["1A", "2A", "3A", "SL"]),
    ("16603", "Maveli Express", "Express", "ERS", "ALLP", 75, 120,
     [True, True, True, True, True, True, True], ["SL", "2S"]),
    ("16604", "Maveli Express", "Express", "ALLP", "ERS", 75, 120,
     [True, True, True, True, True, True, True], ["SL", "2S"]),
    ("12083", "Jan Shatabdi", "Jan Shatabdi", "TVC", "ERS", 234, 270,
     [True, True, True, True, True, True, False], ["CC", "2S"]),
    ("12084", "Jan Shatabdi", "Jan Shatabdi", "ERS", "TVC", 234, 270,
     [True, True, True, True, True, True, False], ["CC", "2S"]),
]

for number, name, ttype, src, dst, dist, dur, runs_on, classes in trains_data:
    cur.execute("""
        INSERT INTO trains (train_number, name, train_type, source_station_code,
            destination_station_code, distance_km, duration_minutes, runs_on, classes, zone_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (train_number) DO UPDATE SET
            name=EXCLUDED.name, train_type=EXCLUDED.train_type,
            source_station_code=EXCLUDED.source_station_code,
            destination_station_code=EXCLUDED.destination_station_code,
            distance_km=EXCLUDED.distance_km, duration_minutes=EXCLUDED.duration_minutes,
            runs_on=EXCLUDED.runs_on, classes=EXCLUDED.classes
    """, (number, name, ttype, src, dst, dist, dur, runs_on, classes, sr_id))

conn.commit()
print(f"  Inserted {len(trains_data)} trains")

# ============================================================
# TIMETABLE for Kerala Express (12625: TVC → NDLS)
# ============================================================
print("Inserting Kerala Express (12625) timetable...")
cur.execute("SELECT id FROM trains WHERE train_number = '12625'")
train_id = cur.fetchone()[0]

# Key stops with (stop_number, station_code, arrival, departure, dist_km, day_offset)
# Partial timetable - major stops
kerala_express_stops = [
    (1,  "TVC",  None,       "22:00", 0,      0),
    (2,  "VAD",  "22:52",    "22:54", 58,     0),
    (3,  "QLN",  "23:28",    "23:33", 92,     0),
    (4,  "ALLP", "00:20",    "00:25", 148,    1),
    (5,  "KTYM", "01:25",    "01:27", 186,    1),
    (6,  "ERN",  "02:20",    "02:25", 233,    1),
    (7,  "ERS",  "02:35",    "02:45", 234,    1),
    (8,  "AWY",  "03:13",    "03:15", 251,    1),
    (9,  "TCR",  "04:05",    "04:15", 305,    1),
    (10, "SRR",  "04:55",    "05:00", 346,    1),
    (11, "PGT",  "06:05",    "06:15", 385,    1),
    (12, "CBE",  "08:05",    "08:15", 456,    1),
    (13, "SA",   "10:40",    "10:45", 568,    1),
    (14, "MDU",  "14:05",    "14:15", 693,    1),
    (15, "TPJ",  "17:25",    "17:35", 791,    1),
    (16, "MAS",  "21:35",    "22:05", 921,    1),
    (17, "NDLS", "06:00",    None,    3052,   2),
]

for stop_num, code, arr, dep, dist, day_off in kerala_express_stops:
    halt = None
    if arr and dep:
        from datetime import datetime
        fmt = "%H:%M"
        a = datetime.strptime(arr, fmt)
        d = datetime.strptime(dep, fmt)
        diff = (d - a).total_seconds() / 60
        if diff < 0:
            diff += 1440
        halt = int(diff)

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
    """, (train_id, code, stop_num, arr, dep, halt, dist, day_off))

conn.commit()
print(f"  Inserted {len(kerala_express_stops)} stops for Kerala Express")

# ============================================================
# TIMETABLE for Venad Express (16301: TVC → SRR) - full stops
# ============================================================
print("Inserting Venad Express (16301) timetable...")
cur.execute("SELECT id FROM trains WHERE train_number = '16301'")
train_id_venad = cur.fetchone()[0]

venad_stops = [
    (1,  "TVC",  None,    "06:00", 0,   0),
    (2,  "VAD",  "06:47", "06:48", 58,  0),
    (3,  "QLN",  "07:20", "07:22", 92,  0),
    (4,  "ALLP", "08:15", "08:17", 148, 0),
    (5,  "KTYM", "09:05", "09:07", 186, 0),
    (6,  "ERN",  "10:00", "10:02", 233, 0),
    (7,  "ERS",  "10:10", "10:15", 234, 0),
    (8,  "AWY",  "10:42", "10:43", 251, 0),
    (9,  "TCR",  "11:25", "11:30", 305, 0),
    (10, "SRR",  "12:05", None,    345, 0),
]

for stop_num, code, arr, dep, dist, day_off in venad_stops:
    halt = None
    if arr and dep:
        from datetime import datetime
        fmt = "%H:%M"
        a = datetime.strptime(arr, fmt)
        d = datetime.strptime(dep, fmt)
        diff = (d - a).total_seconds() / 60
        if diff < 0:
            diff += 1440
        halt = int(diff)
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
    """, (train_id_venad, code, stop_num, arr, dep, halt, dist, day_off))

conn.commit()
print(f"  Inserted {len(venad_stops)} stops for Venad Express")

cur.close()
conn.close()

print("\nSeed complete!")
print("Summary:")
print(f"  Zones: {len(zones)}")
print(f"  Divisions: {len(divisions)}")
print(f"  Stations: {len(stations)}")
print(f"  Trains: {len(trains_data)}")
