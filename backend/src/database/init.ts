import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../phonegpt.db');
export const db = new Database(DB_PATH);

export function initializeDatabase() {
  console.log('🗄️  Initializing database...');

  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chatSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    sessionName TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chatMessages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES chatSessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS glassSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    sessionName TEXT NOT NULL,
    deviceId TEXT,
    persona TEXT DEFAULT 'work',
    wpm INTEGER DEFAULT 180,
    is_active BOOLEAN DEFAULT 0,
    is_paused BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS glassConversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    responsePages TEXT,
    currentPage INTEGER DEFAULT 0,
    duration INTEGER,
    persona TEXT DEFAULT 'work',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES glassSessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    content TEXT NOT NULL,
    persona TEXT DEFAULT 'work',
    type TEXT DEFAULT 'upload',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transcriptionNotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    persona TEXT DEFAULT 'work',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'manual',
    sourceSessionId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sourceSessionId) REFERENCES glassSessions(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS mentraosDevices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    deviceId TEXT UNIQUE NOT NULL,
    deviceName TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
  `);

  runMigrations();
  console.log('✅ Database initialized');
}

function runMigrations() {
  try {
    db.prepare('SELECT persona FROM glassConversations LIMIT 1').get();
  } catch (error) {
    console.log('📊 Adding persona column to glassConversations...');
    db.prepare('ALTER TABLE glassConversations ADD COLUMN persona TEXT DEFAULT "work"').run();
    console.log('✅ Migration complete');
  }

  try {
    db.prepare('SELECT type FROM documents LIMIT 1').get();
  } catch (error) {
    console.log('📊 Adding type column to documents...');
    db.prepare('ALTER TABLE documents ADD COLUMN type TEXT DEFAULT "upload"').run();
    console.log('✅ Migration complete');
  }

  try {
    db.prepare('SELECT conversation_state FROM glassSessions LIMIT 1').get();
  } catch (error) {
    console.log('📊 Adding conversation_state column to glassSessions...');
    db.prepare('ALTER TABLE glassSessions ADD COLUMN conversation_state TEXT DEFAULT "idle"').run();
    console.log('✅ Migration complete');
  }

  try {
    db.prepare('SELECT active_conversation_id FROM glassSessions LIMIT 1').get();
  } catch (error) {
    console.log('📊 Adding active_conversation_id column to glassSessions...');
    db.prepare('ALTER TABLE glassSessions ADD COLUMN active_conversation_id INTEGER').run();
    console.log('✅ Migration complete');
  }

  try {
    db.prepare('SELECT conversation_name FROM glassSessions LIMIT 1').get();
  } catch (error) {
    console.log('📊 Adding conversation_name column to glassSessions...');
    db.prepare('ALTER TABLE glassSessions ADD COLUMN conversation_name TEXT').run();
    console.log('✅ Migration complete');
  }

  try {
    db.prepare('SELECT page_display_duration FROM glassSessions LIMIT 1').get();
  } catch (error) {
    db.exec('ALTER TABLE glassSessions ADD COLUMN page_display_duration INTEGER DEFAULT 5000');
    console.log('✅ Added page_display_duration column to glassSessions');
  }

  try {
    db.prepare('SELECT auto_advance_pages FROM glassSessions LIMIT 1').get();
  } catch (error) {
    db.exec('ALTER TABLE glassSessions ADD COLUMN auto_advance_pages BOOLEAN DEFAULT 1');
    console.log('✅ Added auto_advance_pages column to glassSessions');
  }
}
