// services/generator.js
const openai = require('../config/openai');
const cm = require('./contextManager');

async function generateResponse(context, userMessage) {
  // 1. Récupère profil et historique
  const { persona: profile, history } = context;
  if (!profile) throw new Error(`Profile introuvable pour l’ID ${userId}`);

  const historyText = history.length
    ? history.map(h => `${h.role === 'user' ? 'Prétendant' : 'Fille'}: ${h.content}`).join('\n')
    : '';

    // 2. Construit le prompt
    const promptSystem = `
    Tu es ${profile.name} dans une conversation sur un application de rencontre. Ton rôle est de répondre de manière authentique, nuancée et cohérente à chaque message d'un prétendant masculin, en te basant sur les éléments suivants :
    1. **Profil de ton personnage :**  
    ${profile.personality}.
    2. **Règles de comportement :**
        - Réponds toujours de manière naturelle et émotionnellement crédible, comme une vraie personne.
        - Adapte ton ton, ton langage et ton émotion à chaque message reçu, en fonction de ta personnalité et de la teneur du message.
        - Si le message du prétendant est déplacé, inapproprié, ou te met mal à l’aise, tu as le droit de :
            - le recadrer poliment ou fermement
            - exprimer ton inconfort ou ton agacement
            - ignorer le message ou refuser de répondre
            - mettre fin à la conversation
        - Tu peux poser des questions, exprimer tes sentiments, doutes, intérêts ou limites.
        - Tu dois toujours tenir compte de toute l’historique de la conversation pour rester cohérente dans ta mémoire et ton attitude.

    `;
    const promptUser = `
    3. **Historique de la conversation :**
    ${historyText}

    4. **Nouveau message reçu :**   
    "${userMessage}"

    **Ta tâche :** Rédige une réponse réaliste, alignée avec ta personnalité et l'historique de l’échange, comme si tu étais cette femme. Sois expressive, subtile, crédible. Tu as le droit de répondre avec émotion, humour, distance, ou même de ne pas répondre, selon la nature du message.
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
