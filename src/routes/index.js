const express = require('express');
const router = express.Router();
const aboutContent = require('../../content/about.json'); // Chemin relatif vers content

// Route d'accueil
router.get('/', (req, res) => {
  res.status(200).send(`
    <h1>Bienvenue</h1>
    <p>Entrer /hello suivi du nom Pierre-Louis pour pouvoir accéder au "site"</p>
  `);
});

// Route /hello avec paramètres
router.get('/hello', (req, res) => {
  const { name } = req.query;

  if (!name) {
    res.status(200).send('Bonjour monsieur anonyme');
  } else if (name === 'Pierre-Louis') {
    res.status(200).send(`
      <p>Hello Pierre-Louis</p>
      <p>Je suis étudiant à l'ECE</p>
    `);
  } else {
    res.status(200).send(`<p>Hello ${name}</p>`);
  }
});

// Route /about qui renvoie le JSON
router.get('/about', (req, res) => {
  res.status(200).json(aboutContent);
});

// Gestion 404 - doit toujours être à la fin
router.use((req, res) => {
  res.status(404).send('<h1>Page non trouvée</h1>');
});

module.exports = router;
