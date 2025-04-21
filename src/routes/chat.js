const express = require('express');
const router = express.Router();

const contextManager = require('../services/contextManager');
const generator = require('../services/generator');
const scorer = require('../services/scorer');

/**
 * POST /api/chat
 * Body: { userId: string, message: string }
 * Réponse: { aiResponse: string, score: number, tip?: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, message, personaId = 'default' } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    // 1. Récupérer contexte (profil + historique)
    const context = await contextManager.getContext(userId, personaId);

    // 2. Générer réponse IA
    const aiResponse = await generator.generateResponse(context, message);

    // 3. Évaluer le message de l'utilisateur
    const { score, tip } = await scorer.scoreMessage(context, message);

    // 4. Stocker un tip si nécessaire
    if (tip) {
        await contextManager.addTip(userId, tip);
    }

    console.log("réponse : ", res)

    // 5. Retourner le résultat
    res.json({ aiResponse, score, tip });
  } catch (err) {
    next(err);
  }
});

module.exports = router;