const express = require('express')
const { v4: uuidv4 } = require('uuid') 
const db = require('../db')

const router = express.Router()

// Partie GET du code qui nous permet d'avoir tous les commentaires d'un article
router.get('/', (req, res) => {
  res.json(db.articles)
})

// Partie POST du code qui ajoute un article
router.post('/', (req, res) => {
  const { title, content, author } = req.body
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newArticle = {
    id: uuidv4(),
    title,
    content,
    date: new Date().toLocaleDateString(),
    author
  }

  db.articles.push(newArticle)
  res.status(201).json(newArticle)
})

// Partie GET du code qui nous permet d'avoir un commentaire spécifique d'un article
router.get('/:articleId', (req, res) => {
  const article = db.articles.find(a => a.id === req.params.articleId)
  if (!article) {
    return res.status(404).json({ error: 'Article not found' })
  }
  res.json(article)
})

module.exports = router
