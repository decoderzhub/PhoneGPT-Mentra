import Database from 'better-sqlite3';

export const db = new Database('phonegpt.db');

export function initializeDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    -- Chat sessions (web interface)
    CREATE TABLE IF NOT EXISTS chatSessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      sessionName TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Chat messages
    CREATE TABLE IF NOT EXISTS chatMessages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES chatSessions(id) ON DELETE CASCADE
    );

    -- Glass sessions (MentraOS glasses)
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

    -- Glass conversations (Q&A pairs from glasses)
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

    -- Documents with persona support
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      content TEXT NOT NULL,
      persona TEXT DEFAULT 'work',
      embedding BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User personas settings
    CREATE TABLE IF NOT EXISTS userPersonas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      persona TEXT NOT NULL,
      settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, persona),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- MentraOS devices
    CREATE TABLE IF NOT EXISTS mentraosDevices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT UNIQUE NOT NULL,
      userId INTEGER NOT NULL,
      sessionId INTEGER,
      deviceModel TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_sync DATETIME,
      battery_level INTEGER,
      is_connected BOOLEAN DEFAULT 1,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sessionId) REFERENCES glassSessions(id) ON DELETE CASCADE
    );

    -- Transcription notes for each persona
    CREATE TABLE IF NOT EXISTS transcriptionNotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      persona TEXT NOT NULL,
      title TEXT,
      transcript TEXT NOT NULL,
      summary TEXT,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  checkAndAddColumns();
  runMigrations();
}

function checkAndAddColumns() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(glassSessions)").all();
    const columnNames = tableInfo.map((col: any) => col.name);

    if (!columnNames.includes('page_display_duration')) {
      db.exec('ALTER TABLE glassSessions ADD COLUMN page_display_duration INTEGER DEFAULT 5000');
      console.log('✅ Added page_display_duration column');
    }

    if (!columnNames.includes('auto_advance_pages')) {
      db.exec('ALTER TABLE glassSessions ADD COLUMN auto_advance_pages BOOLEAN DEFAULT 1');
      console.log('✅ Added auto_advance_pages column');
    }
  } catch (error) {
    console.log('Database columns already exist or error adding them:', error);
  }
}

function runMigrations() {
  const migrations = [
    {
      name: 'persona column to glassConversations',
      check: 'SELECT persona FROM glassConversations LIMIT 1',
      execute: 'ALTER TABLE glassConversations ADD COLUMN persona TEXT DEFAULT "work"'
    },
    {
      name: 'type column to documents',
      check: 'SELECT type FROM documents LIMIT 1',
      execute: 'ALTER TABLE documents ADD COLUMN type TEXT DEFAULT "upload"'
    },
    {
      name: 'conversation_state column to glassSessions',
      check: 'SELECT conversation_state FROM glassSessions LIMIT 1',
      execute: 'ALTER TABLE glassSessions ADD COLUMN conversation_state TEXT DEFAULT "idle"'
    },
    {
      name: 'active_conversation_id column to glassSessions',
      check: 'SELECT active_conversation_id FROM glassSessions LIMIT 1',
      execute: 'ALTER TABLE glassSessions ADD COLUMN active_conversation_id INTEGER'
    },
    {
      name: 'conversation_name column to glassSessions',
      check: 'SELECT conversation_name FROM glassSessions LIMIT 1',
      execute: 'ALTER TABLE glassSessions ADD COLUMN conversation_name TEXT'
    }
  ];

  for (const migration of migrations) {
    try {
      db.prepare(migration.check).get();
    } catch (error) {
      console.log(`📊 Adding ${migration.name}...`);
      db.prepare(migration.execute).run();
      console.log('✅ Migration complete');
    }
  }
}
