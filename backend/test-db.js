import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    await client.connect();
    console.log('Koneksi berhasil');

    const result = await client.query('SELECT NOW()');
    console.log(result.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

test();