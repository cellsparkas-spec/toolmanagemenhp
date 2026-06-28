import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    await client.connect();

  try {
    await client.query(`
     CREATE TYPE phone_status AS ENUM ('in_stock', 'sold');
   `);
} catch (err) {
  console.log('Enum sudah ada');
}

    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS phones (
        id SERIAL PRIMARY KEY,
        imei TEXT NOT NULL UNIQUE,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        color TEXT,
        storage TEXT,
        purchase_price NUMERIC(15,2) NOT NULL DEFAULT 0,
        selling_price NUMERIC(15,2) NOT NULL,
        warranty_months INTEGER NOT NULL DEFAULT 12,
        status phone_status NOT NULL DEFAULT 'in_stock',
        store_id INTEGER REFERENCES stores(id),
        input_staff_id INTEGER REFERENCES staff(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Semua tabel berhasil dibuat');
    await client.end();

  } catch (err) {
    console.error(err);
  }
}

createTables();