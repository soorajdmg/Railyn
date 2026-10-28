from shapely.geometry import LineString, Point


def make_point_wkt(lon: float, lat: float) -> str:
    """Create a WKT POINT string."""
    return f"SRID=4326;POINT({lon} {lat})"


def make_linestring_wkt(coords: list[tuple[float, float]]) -> str:
    """Create a WKT LINESTRING from list of (lon, lat) tuples."""
    coords_str = ", ".join(f"{lon} {lat}" for lon, lat in coords)
    return f"SRID=4326;LINESTRING({coords_str})"


def validate_india_bbox(lat: float, lon: float) -> bool:
    """Check if coordinates are within India bounding box."""
    return 6.7 <= lat <= 35.7 and 68.1 <= lon <= 97.4


def compute_day_offsets(stops: list[dict]) -> list[dict]:
    """
    Compute day_offset for each stop.
    Increments day when arrival time is before previous departure time (midnight crossover).
    """
    day = 0
    prev_dep = None

    for stop in stops:
        arr = stop.get('arrival_time')
        dep = stop.get('departure_time')

        if prev_dep and arr:
            # Midnight crossover detection
            from datetime import datetime
            fmt = "%H:%M"
            try:
                t_arr = datetime.strptime(str(arr)[:5], fmt)
                t_dep = datetime.strptime(str(prev_dep)[:5], fmt)
                if t_arr < t_dep:
                    day += 1
            except ValueError:
                pass

        stop['day_offset'] = day
        prev_dep = dep or arr

    return stops
