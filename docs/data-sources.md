# Data Sources

All data used in Railyn must come from publicly available, authorised, or appropriately licensed sources.

> **Always verify licensing before using any dataset commercially or redistributing it.**

## Station Data

| Source | URL | License | Format | Last Verified |
|--------|-----|---------|--------|---------------|
| data.gov.in — Indian Railways Stations | https://data.gov.in | Government Open Data (NOGI) | CSV | Verify at use |
| OpenStreetMap (Overpass API) | https://overpass-api.de | ODbL | GeoJSON | Verify at use |

**Overpass query for India railway stations:**
```
node["railway"="station"]["country"="IN"]
```

**Caveats:**
- data.gov.in station list may have outdated coordinates or missing elevation data
- OSM data quality varies by region; rural stations may be less accurate

## Train Timetable Data

| Source | URL | License | Format | Last Verified |
|--------|-----|---------|--------|---------------|
| data.gov.in — Train Time Table | https://data.gov.in | Government Open Data (NOGI) | CSV/JSON | Verify at use |
| NTES (National Train Enquiry System) | https://enquiry.indianrail.gov.in | Public access (no redistribution) | Web | Do not scrape |

**Important Note on NTES:** Automated scraping of NTES may violate their Terms of Service. Always prefer the official datasets from data.gov.in.

**Caveats:**
- Indian Railways updates timetables typically twice a year (June and January)
- The CSV from data.gov.in may not include all special/seasonal trains

## Track Geometry

| Source | URL | License | Format | Last Verified |
|--------|-----|---------|--------|---------------|
| Geofabrik India Extract | https://download.geofabrik.de/asia/india.html | ODbL | PBF/Shapefile | Verify at use |
| OSM Overpass API | https://overpass-api.de | ODbL | GeoJSON | Verify at use |

**Overpass query for railway tracks:**
```
way["railway"="rail"]
way["railway"="narrow_gauge"]
way["railway"="monorail"]
```

**Caveats:**
- OSM track alignments may not be perfectly accurate for all corridors
- Geofabrik extracts are updated periodically; download date matters

## Base Map Tiles

| Source | URL | License | Notes |
|--------|-----|---------|-------|
| OpenFreeMap | https://openfreemap.org | ODbL | Free tier available |
| MapTiler | https://maptiler.com | Commercial (free tier) | Requires API key |

## Attribution Requirements

### OpenStreetMap / ODbL
Any use of OSM data requires attribution: "© OpenStreetMap contributors". The full ODbL license is at https://opendatacommons.org/licenses/odbl/

### data.gov.in
Data is published under the National Data Sharing and Accessibility Policy (NDSAP). Attribution: "Source: data.gov.in, Government of India"

---
*Last updated: Project inception*
