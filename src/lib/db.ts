// src/lib/db.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

/**
 * Executes a parameterized SQL query.
 * Returns a typed QueryResult<T>
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await pool.connect();

  try {
    const res = await client.query<T>(text, params);
    return res;
  } catch (err) {
    console.error("DB Error:", err);
    throw err;
  } finally {
    client.release();
  }
}
