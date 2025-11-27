// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

/**
 * Ejecuta una query SQL parametrizada.
 * No usa ORM. Usa pg nativo.
 */
export async function query<T = any>(text: string, params?: any[]) {
  const client = await pool.connect();

  try {
    const res = await client.query<T>(text, params);
    return res;
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  } finally {
    client.release();
  }
}
