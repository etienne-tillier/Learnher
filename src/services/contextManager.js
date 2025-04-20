// services/contextManager.js
const path = require('path');
const Database = require('better-sqlite3');

// Ouvre (ou crée) la base dans ./data/mvp.db
const dbPath = path.resolve(__dirname, '../../data/mvp.db');
const db = new Database(dbPath);

// Création des tables si nécessaire
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

// Profils
const getProfile = (profileId) => {
  const stmt = db.prepare(`SELECT * FROM profiles WHERE id = ?`);
  const profile = stmt.get(profileId);
     if (!profile) throw new Error(`Persona IA introuvable pour l’ID '${profileId}'`);
     return profile;
    };

const listProfiles = () => {
  return db.prepare(`SELECT * FROM profiles`).all();
};

// Messages / Historique
const addMessage = (userId, role, content) => {
  const stmt = db.prepare(`
    INSERT INTO messages (user_id, role, content)
    VALUES (?, ?, ?)
  `);
  stmt.run(userId, role, content);
};

const getConversation = (userId) => {
  const stmt = db.prepare(`
    SELECT role, content, timestamp 
    FROM messages 
    WHERE user_id = ? 
    ORDER BY id ASC
  `);
  return stmt.all(userId);
};

const resetConversation = (userId) => {
  db.prepare(`DELETE FROM messages WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM tips WHERE user_id = ?`).run(userId);
};

// Tips
const addTip = (userId, tipText) => {
  const stmt = db.prepare(`
    INSERT INTO tips (user_id, tip) VALUES (?, ?)
  `);
  stmt.run(userId, tipText);
};

const getTips = (userId) => {
  return db.prepare(`
    SELECT tip, timestamp 
    FROM tips 
    WHERE user_id = ? 
    ORDER BY id ASC
  `).all(userId);
};


// Ajoute en bas du fichier :
/**
+ * Récupère le contexte complet pour un user et une persona IA
+ * @param {string} userId    // l’utilisateur connecté
+ * @param {string} personaId // la “femme” IA à utiliser
+ * @returns {Object} { userId, persona, history }
+ */
function getContext(userId, personaId = 'default') {
    // 1️⃣ charge la persona IA depuis la table profiles
    const persona = getProfile(personaId);
    if (!persona) throw new Error(`Persona IA introuvable : ${personaId}`);

    // 2️⃣ charge tout l’historique de cet user
    const history = getConversation(userId); // messages.user & assistant

  return { userId, persona, history };
}



module.exports = {
  getProfile,
  listProfiles,
  addMessage,
  getConversation,
  resetConversation,
  addTip,
  getTips,
  getContext, 
};
