from __future__ import annotations
from typing import Any

from geoalchemy2.shape import to_shape


def geom_to_geojson(geom) -> dict | None:
    """Convert GeoAlchemy2 geometry to GeoJSON dict."""
    if geom is None:
        return None
    try:
        shape = to_shape(geom)
        return {
            "type": shape.geom_type,
            "coordinates": list(shape.coords) if hasattr(shape, "coords") else shape.__geo_interface__["coordinates"],
        }
    except Exception:
        return None


def point_to_geojson(geom) -> dict | None:
    """Convert a PostGIS Geography POINT to GeoJSON Point dict."""
    if geom is None:
        return None
    try:
        shape = to_shape(geom)
        return {
            "type": "Point",
            "coordinates": [shape.x, shape.y],
        }
    except Exception:
        return None


def linestring_to_geojson(geom) -> dict | None:
    """Convert a PostGIS LINESTRING to GeoJSON LineString dict."""
    if geom is None:
        return None
    try:
        shape = to_shape(geom)
        return {
            "type": "LineString",
            "coordinates": list(shape.coords),
        }
    except Exception:
        return None
