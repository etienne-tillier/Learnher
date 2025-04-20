// services/generator.js
const openai = require('../config/openai');
const cm = require('./contextManager');

async function generateResponse(context, userMessage) {
  // 1. Récupère profil et historique
  const { persona: profile, history } = context;
  if (!profile) throw new Error(`Profile introuvable pour l’ID ${userId}`);

  const historyText = history.length
    ? history.map(h => `${h.role === 'user' ? 'Utilisateur' : 'Assistante'}: ${h.content}`).join('\n')
    : '';

    // 2. Construit le prompt
    const promptSystem = `
    Tu es ${profile.name}, ${profile.age} ans, personnalité : ${profile.personality}.
    Réponds de façon naturelle et cohérente, fidèle à cette personnalité.
    `;
    const promptUser = `
    Historique :
    ${historyText}

    Nouvelle question de l’utilisateur :
    "${userMessage}"
    `;

  // 3. Appel à l’API OpenAI
  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: promptSystem.trim() },
      { role: 'user', content: promptUser.trim() }
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  // 4. Retourne le texte de l’assistante
  return resp.choices[0].message.content.trim();
}

module.exports = { generateResponse };
