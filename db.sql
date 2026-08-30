CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS stations;

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    plug_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    kw_output INTEGER NOT NULL
);

CREATE INDEX idx_stations_location
ON stations
USING GIST (location);