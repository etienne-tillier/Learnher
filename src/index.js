require('dotenv').config();
const express = require('express');
const chatRouter = require('./routes/chat');

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

// Gestion des erreurs basique
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));