require('dotenv').config();

const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432
});

async function seedDatabase() {
    try {
        const data = JSON.parse(fs.readFileSync('./stations.json', 'utf8'));

        for (const station of data) {
            await pool.query(
                `INSERT INTO stations
                    (name, location, plug_type, status, kw_output)
                VALUES
                    ($1,
                     ST_SetSRID(
                         ST_MakePoint($2, $3),
                         4326
                     )::geography,
                     $4,
                     $5,
                     $6)`,
                [
                    station.name,
                    station.lon,
                    station.lat,
                    station.plug_type,
                    station.status,
                    station.kw_output
                ]
            );
        }

        console.log(`Seeded ${data.length} station records.`);
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedDatabase();