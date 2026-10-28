"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography, Geometry
import sqlalchemy.dialects.postgresql as pg

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable PostGIS
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # zones
    op.create_table(
        'zones',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('code', sa.String(10), nullable=False, unique=True),
        sa.Column('hq_city', sa.String(100)),
        sa.Column('hq_station_code', sa.String(10)),
        sa.Column('website', sa.String(500)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # divisions
    op.create_table(
        'divisions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('code', sa.String(10), nullable=False, unique=True),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('zones.id'), nullable=False),
        sa.Column('hq_city', sa.String(100)),
        sa.Column('hq_station_code', sa.String(10)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # stations
    op.create_table(
        'stations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('code', sa.String(10), nullable=False, unique=True),
        sa.Column('name_aliases', pg.ARRAY(sa.String())),
        sa.Column('location', Geography(geometry_type='POINT', srid=4326)),
        sa.Column('elevation_m', sa.Float()),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('zones.id')),
        sa.Column('division_id', sa.Integer(), sa.ForeignKey('divisions.id')),
        sa.Column('state', sa.String(100)),
        sa.Column('is_junction', sa.Boolean(), default=False),
        sa.Column('is_terminus', sa.Boolean(), default=False),
        sa.Column('platform_count', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_stations_code', 'stations', ['code'])
    op.execute("CREATE INDEX IF NOT EXISTS idx_stations_location ON stations USING gist (location)")

    # railway_lines
    op.create_table(
        'railway_lines',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('code', sa.String(50)),
        sa.Column('line_type', sa.String(50)),
        sa.Column('gauge', sa.String(20), default='BG'),
        sa.Column('electrified', sa.Boolean(), default=False),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('zones.id')),
        sa.Column('geometry', Geometry(geometry_type='LINESTRING', srid=4326)),
        sa.Column('length_km', sa.Float()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_railway_lines_geom ON railway_lines USING gist (geometry)")

    # trains
    op.create_table(
        'trains',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('train_number', sa.String(10), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('train_type', sa.String(50)),
        sa.Column('source_station_code', sa.String(10), sa.ForeignKey('stations.code')),
        sa.Column('destination_station_code', sa.String(10), sa.ForeignKey('stations.code')),
        sa.Column('distance_km', sa.Float()),
        sa.Column('duration_minutes', sa.Integer()),
        sa.Column('runs_on', pg.ARRAY(sa.Boolean())),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('zones.id')),
        sa.Column('route_geometry', Geometry(geometry_type='LINESTRING', srid=4326)),
        sa.Column('classes', pg.ARRAY(sa.String())),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_trains_number', 'trains', ['train_number'])
    op.create_index('idx_trains_source', 'trains', ['source_station_code'])
    op.create_index('idx_trains_dest', 'trains', ['destination_station_code'])
    op.execute("CREATE INDEX IF NOT EXISTS idx_trains_route_geom ON trains USING gist (route_geometry)")

    # timetable_stops
    op.create_table(
        'timetable_stops',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('train_id', sa.Integer(), sa.ForeignKey('trains.id', ondelete='CASCADE'), nullable=False),
        sa.Column('station_code', sa.String(10), sa.ForeignKey('stations.code'), nullable=False),
        sa.Column('stop_number', sa.Integer(), nullable=False),
        sa.Column('arrival_time', sa.Time()),
        sa.Column('departure_time', sa.Time()),
        sa.Column('halt_minutes', sa.Integer()),
        sa.Column('distance_from_origin_km', sa.Float()),
        sa.Column('day_offset', sa.Integer(), default=0),
        sa.Column('platform', sa.String(10)),
        sa.UniqueConstraint('train_id', 'stop_number', name='uq_train_stop_number'),
        sa.UniqueConstraint('train_id', 'station_code', name='uq_train_station'),
    )
    op.create_index('idx_stops_train', 'timetable_stops', ['train_id'])
    op.create_index('idx_stops_station', 'timetable_stops', ['station_code'])
    op.create_index('idx_stops_train_stop', 'timetable_stops', ['train_id', 'stop_number'])

    # track_segments
    op.create_table(
        'track_segments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('from_station_code', sa.String(10), sa.ForeignKey('stations.code'), nullable=False),
        sa.Column('to_station_code', sa.String(10), sa.ForeignKey('stations.code'), nullable=False),
        sa.Column('railway_line_id', sa.Integer(), sa.ForeignKey('railway_lines.id')),
        sa.Column('geometry', Geometry(geometry_type='LINESTRING', srid=4326), nullable=False),
        sa.Column('length_km', sa.Float()),
        sa.Column('gauge', sa.String(20), default='BG'),
        sa.Column('electrified', sa.Boolean(), default=False),
        sa.Column('max_speed_kmph', sa.Integer()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('from_station_code', 'to_station_code', name='uq_segment_from_to'),
    )
    op.create_index('idx_segments_from', 'track_segments', ['from_station_code'])
    op.create_index('idx_segments_to', 'track_segments', ['to_station_code'])
    op.execute("CREATE INDEX IF NOT EXISTS idx_segments_geom ON track_segments USING gist (geometry)")

    # station_lines
    op.create_table(
        'station_lines',
        sa.Column('station_code', sa.String(10), sa.ForeignKey('stations.code'), primary_key=True),
        sa.Column('railway_line_id', sa.Integer(), sa.ForeignKey('railway_lines.id'), primary_key=True),
    )

    # import_runs
    op.create_table(
        'import_runs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('source_name', sa.String(255)),
        sa.Column('entity_type', sa.String(50)),
        sa.Column('records_total', sa.Integer()),
        sa.Column('records_inserted', sa.Integer()),
        sa.Column('records_updated', sa.Integer()),
        sa.Column('records_skipped', sa.Integer()),
        sa.Column('errors_count', sa.Integer()),
        sa.Column('error_log', sa.Text()),
        sa.Column('run_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('import_runs')
    op.drop_table('station_lines')
    op.drop_table('track_segments')
    op.drop_table('timetable_stops')
    op.drop_table('trains')
    op.drop_table('railway_lines')
    op.drop_table('stations')
    op.drop_table('divisions')
    op.drop_table('zones')
