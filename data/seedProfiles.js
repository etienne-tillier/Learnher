// data/seedProfiles.js
const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.resolve(__dirname, 'mvp.db'));

// On remplace ou crée la persona par défaut
const stmt = db.prepare(`
  INSERT OR REPLACE INTO profiles (id, name, age, personality)
  VALUES (?, ?, ?, ?)
`);

stmt.run(
  'default',             // → personaId
  'Léa',                 // → prénom
  26,                    // → âge
  // → description longue pour guider l’IA au max
  `Femme réservée et observatrice,  
   adore la littérature classique, les expositions photo  
   et la méditation matinale.  
   Elle répond toujours posément, avec des questions ouvertes  
   pour tester la curiosité de son interlocuteur.  
   Ton chaleureux mais discret, petite touche d’humour subtil.`
);

console.log('✅ Persona "default" seedée avec succès.');
