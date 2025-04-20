// data/initDb.js
const path = require('path');
const Database = require('better-sqlite3');

// Ouvre (ou crée) la base dans ./data/mvp.db
const dbPath = path.resolve(__dirname, 'mvp.db');
const db = new Database(dbPath);

// Création des tables
db.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  personality TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role TEXT CHECK(role IN ('user','assistant')) NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tip TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

console.log('✅ Tables SQLite créées (ou déjà existantes) dans data/mvp.db');
process.exit(0);
