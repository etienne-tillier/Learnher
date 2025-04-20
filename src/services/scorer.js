// services/scorer.js
const openai = require('../config/openai');
const contextManager = require('./contextManager');

 /**
  * Évalue le dernier message de l’utilisateur selon les critères définis
  * et renvoie { score: number, tip: string | null }.
  *
  * @param {Object} context        // issu de contextManager.getContext()
  * @param {string} userMessage    // le texte du message utilisateur
  */
async function scoreMessage(context, userMessage) {
  const { persona } = context;

  // 1️⃣ Construire le prompt de scoring
  const systemPrompt = `
Tu es un assistant chargé d'évaluer la qualité d'un message dans un contexte de séduction.

Critères (pondérations) :
- Pertinence par rapport à la personnalité (${persona.personality}) : 1 point
- Ton adapté et respectueux : 1 point
- Originalité : 0.5 point

Attribue un score total entre -2.5 et +2.5 (inclus).
Si le score est négatif (<0), suggère une "tip" courte pour améliorer le prochain message.
Si le score est ≥0, renvoie "tip": "".

**IMPORTANT** : RÉPONDS STRICTEMENT au format JSON :
{
  "score": <nombre décimal>,
  "tip": <string>
}
  `.trim();

  const userPrompt = `
Message à évaluer :
"${userMessage}"
  `.trim();

  // 2️⃣ Appel à l’API OpenAI
  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.0,
    max_tokens: 150,
  });

  // 3️⃣ Parser la réponse JSON
  let parsed;
  try {
    parsed = JSON.parse(resp.choices[0].message.content);
  } catch (err) {
    throw new Error(`Erreur parsing JSON de scoring: ${resp.choices[0].message.content}`);
  }

  return {
    score: parsed.score,
    tip: parsed.tip && parsed.tip.length ? parsed.tip : null
  };
}

/**
 * Stocke un tip en base pour l’utilisateur
 * @param {string} userId
 * @param {string} tip
 */
async function storeTip(userId, tip) {
  // utilise contextManager pour stocker
  await contextManager.addTip(userId, tip);
}

module.exports = {
  scoreMessage,
  storeTip
};
