import sqlite3 from 'sqlite3';
import { ExtractionMetric } from '../types.js';
import { promisify } from 'util';

const DB_PATH = './data/conversations.db';
let db: sqlite3.Database | null = null;

const getDatabase = (): sqlite3.Database => {
  if (!db) {
    db = new sqlite3.Database(DB_PATH);
    initializeDatabase(db);
  }
  return db;
};

const initializeDatabase = (database: sqlite3.Database): void => {
  database.run(`
    CREATE TABLE IF NOT EXISTS extraction_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME NOT NULL,
      user_id TEXT NOT NULL,
      intent TEXT NOT NULL,
      slots_filled TEXT NOT NULL,
      missing_slots TEXT NOT NULL,
      validation_errors TEXT NOT NULL,
      latency_ms INTEGER NOT NULL,
      tokens_used INTEGER NOT NULL
    )
  `);
};

export const logExtraction = async (metric: ExtractionMetric): Promise<void> => {
  const database = getDatabase();
  const run = promisify(database.run.bind(database)) as (sql: string, params: unknown[]) => Promise<void>;

  await run(
    `INSERT INTO extraction_metrics
     (timestamp, user_id, intent, slots_filled, missing_slots, validation_errors, latency_ms, tokens_used)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      metric.timestamp.toISOString(),
      metric.user_id,
      metric.intent,
      JSON.stringify(metric.slots_filled),
      JSON.stringify(metric.missing_slots),
      JSON.stringify(metric.validation_errors),
      metric.latency_ms,
      metric.tokens_used,
    ]
  );
};
