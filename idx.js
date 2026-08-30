require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const { performance } = require('perf_hooks');

const app = express();

const PORT = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
});

app.get('/search', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lon = parseFloat(req.query.lon);
        const radiusKm = parseFloat(req.query.radius) || 50;
        const plugType = req.query.plug || 'ccs2';

        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            return res.status(400).json({
                error: "Provide valid numeric 'lat' and 'lon' parameters."
            });
        }

        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return res.status(400).json({
                error: 'Coordinates are out of bounds.'
            });
        }

        if (radiusKm <= 0) {
            return res.status(400).json({
                error: 'Radius must be greater than 0.'
            });
        }

        const sql = `
            SELECT
                name,
                kw_output,
                ST_Distance(
                    location,
                    ST_MakePoint($1, $2)::geography
                ) / 1000 AS distance_km
            FROM stations
            WHERE ST_DWithin(
                location,
                ST_MakePoint($1, $2)::geography,
                $3
            )
            AND plug_type = $4
            AND status = 'operational'
            ORDER BY distance_km ASC;
        `;

        const radiusMeters = radiusKm * 1000;
        const values = [lon, lat, radiusMeters, plugType];

        const startTime = performance.now();

        const result = await pool.query(sql, values);

        const dbLatencyMs = (
            performance.now() - startTime
        ).toFixed(2);

        const stations = result.rows.map(row => ({
            name: row.name,
            kw_output: row.kw_output,
            distance_km: Math.round(row.distance_km * 100) / 100
        }));

        console.log(
            `Spatial search: ${dbLatencyMs}ms | Results: ${stations.length}`
        );

        res.json({
            search_coordinates: {
                latitude: lat,
                longitude: lon
            },
            plug_filter: plugType,
            search_radius_km: radiusKm,
            matches_found: stations.length,
            db_latency_ms: Number(dbLatencyMs),
            stations
        });

    } catch (error) {
        console.error('Search error:', error);

        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Geospatial Search API running on port ${PORT}`
    );
});