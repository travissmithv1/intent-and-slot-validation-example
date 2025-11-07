import sqlite3 from 'sqlite3';
import { Message } from '../types.js';
import { promisify } from 'util';

const DB_PATH = './data/conversations.db';
let db: sqlite3.Database | null = null;
let initPromise: Promise<void> | null = null;

const getDatabase = async (): Promise<sqlite3.Database> => {
  if (!db) {
    db = new sqlite3.Database(DB_PATH);
    initPromise = initializeDatabase(db);
  }
  await initPromise;
  return db;
};

const initializeDatabase = async (database: sqlite3.Database): Promise<void> => {
  const run = promisify(database.run.bind(database));
  await run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const saveMessage = async (
  userId: string,
  message: Message
): Promise<void> => {
  const database = await getDatabase();
  const run = promisify(database.run.bind(database)) as (sql: string, params: unknown[]) => Promise<void>;

  await run(
    'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
    [userId, message.role, message.content]
  );
};

export const getConversationHistory = async (
  userId: string
): Promise<Message[]> => {
  const database = await getDatabase();
  const all = promisify(database.all.bind(database)) as (sql: string, params: unknown[]) => Promise<Array<{ role: string; content: string }>>;

  const rows = await all(
    'SELECT role, content FROM conversations WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );

  return rows.map(row => ({
    role: row.role as 'user' | 'assistant',
    content: row.content as string,
  }));
};

export const clearConversation = async (userId: string): Promise<void> => {
  const database = await getDatabase();
  const run = promisify(database.run.bind(database)) as (sql: string, params: unknown[]) => Promise<void>;

  await run('DELETE FROM conversations WHERE user_id = ?', [userId]);
};
