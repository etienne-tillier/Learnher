// config/openai.js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  // si tu n’as pas encore de .env, tu peux ici mettre ta clé en dur pour le MVP :
  // apiKey: 'sk-…'
});

module.exports = openai;
