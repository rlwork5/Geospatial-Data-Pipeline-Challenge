-- Position reports from tracked assets
CREATE TABLE position_reports (
    id              SERIAL PRIMARY KEY,
    asset_id        VARCHAR(50) NOT NULL,
    asset_type      VARCHAR(20) NOT NULL,  -- 'VESSEL', 'AIRCRAFT', 'VEHICLE'
    timestamp       TIMESTAMP WITH TIME ZONE NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_knots     DECIMAL(6,2),
    heading         DECIMAL(5,2),
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Geographic regions of interest
CREATE TABLE regions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    region_type     VARCHAR(30) NOT NULL,
    boundary        GEOGRAPHY(POLYGON, 4326) NOT NULL,
    properties      JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Detected boundary crossings
CREATE TABLE region_crossings (
    id              SERIAL PRIMARY KEY,
    asset_id        VARCHAR(50) NOT NULL,
    region_id       INTEGER REFERENCES regions(id),
    crossing_type   VARCHAR(10) NOT NULL,  -- 'ENTRY', 'EXIT'
    crossing_time   TIMESTAMP WITH TIME ZONE NOT NULL,
    position        GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO regions (name, region_type, boundary) VALUES
('Chesapeake Bay', 'BAY', 'POLYGON((-76.5 36.5, -76.5 39.5, -75.5 39.5, -75.5 36.5, -76.5 36.5))'),
('San Francisco Bay', 'BAY', 'POLYGON((-122.5 37.5, -122.5 38.0, -121.5 38.0, -121.5 37.5, -122.5 37.5))');

INSERT INTO position_reports (asset_id, asset_type, timestamp, location, speed_knots, heading, metadata) VALUES
('VESSEL-7721', 'VESSEL', '2025-01-13T14:30:00Z', 'POINT(-77.0364 38.8951)', 12.5, 45.0, '{"flag": "US", "vessel_name": "Pacific Trader"}'),
('AIRCRAFT-123', 'AIRCRAFT', '2025-01-13T15:00:00Z', 'POINT(-122.4 37.7)', 500.0, 90.0, '{"airline": "Delta"}');