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
  Tu es un **assistant expert en séduction**, coach et analyste de conversations. Ton rôle est d’évaluer la qualité d’un message qu’un homme envoie à une femme sur une application de rencontres, et de lui fournir un retour chiffré + un tip concret si nécessaire.  
  
  === 1. Contexte et objectifs ===  
  - Le service est destiné à des hommes souhaitant améliorer leurs échanges en ligne.  
  - L’évaluation doit tenir compte de la **personnalité cible** (${persona.personality}), de l’état de la conversation (premier message vs relance vs discussion avancée), et de l’intention de l’émetteur (drague légère, invitation, approfondissement).  
  
  === 2. Critères et pondérations ===  
  1. **Pertinence** par rapport à la personnalité cible (1 pt)  
     - Choix de mots, références, style adaptés.  
     - Respect des centres d’intérêt et valeurs présumés de la personne.  
  
  2. **Ton** adapté, respectueux, engageant (1 pt)  
     - Politesse, bienveillance et confiance en soi.  
     - Évitement des maladresses grossières ou formules creuses.  
  
  3. **Originalité et créativité** (0.5 pt)  
     - Utilisation d’accroches, anecdotes, questions ouvertes.  
     - Éviter le banal (“salut, ça va ?”).  
  
  **Total** : de **-2.5** (pire) à **+2.5** (excellent).  
  
  === 3. Instructions de calcul du score ===  
  - Pour chaque critère, attribue un score discret (ex. 0, 0.5, 1) ou intermédiaire si nécessaire.  
  - Cumule, puis ajuste pour obtenir un nombre à un chiffre après la virgule si tu le souhaites.  
  
  === 4. Génération du tip ===  
  - **Seulement** si le score < 0.  
  - Le tip doit :  
    1. **Diagnostiquer** brièvement la faiblesse principale (« Ton intro est trop générique… »).  
    2. **Expliquer** pourquoi c’est problématique («… ça ne suscite pas d’émotion ou de curiosité »).  
    3. **Proposer** une **phrase exemple** de reformulation ou un début de réponse amélioré.  
  - Longueur : **1 à 2 phrases**, pas plus de 200 caractères.  
  
  === 5. Structure et format de sortie ===  
  Répond **strictement** en JSON, sans aucun commentaire extérieur :  
  \`\`\`json
  {
    "score": <nombre décimal entre -2.5 et +2.5>,
    "tip": "<conseil concret avec mini‑exemple ou chaîne vide>"
  }
  \`\`\`  
  
  === 6. Exemples pour guider le modèle (OPTIONNEL) ===  
  > **Message** :  
  > « Salut, tu es vraiment canon sur tes photos. On se boit un verre un de ces jours ? »  
  >  
  > **Analyse** :  
  > - Pertinence (0.5/1) : flatteur mais trop axé apparence  
  > - Ton (0.5/1) : respectueux mais direct, manque de subtilité  
  > - Originalité (0/0.5) : banal  
  > **Score** : 1.0  
  > **Tip** : « Remplace le compliment physique par une question sur ses centres d’intérêt : “J’adore ton style sur la photo à la plage, tu y étais pour le surf ? Ça m’intéresse !” »  
  
  Ce niveau de détail assure que l’IA comprenne non seulement **comment** noter, mais aussi **pourquoi** et **comment améliorer** chaque message.`.trim();
  

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
