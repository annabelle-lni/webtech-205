const express = require('express')
const router = express.Router()
const db = require('../db')
const { v4: uuidv4 } = require('uuid')

router.get('/', (req, res) => {
  res.json(db.articles)
})

router.get('/:id', (req, res) => {
  const article = db.articles.find(a => a.id === req.params.id)
  if (!article) {
    return res.status(404).json({ error: 'Article non trouvé' })
  }
  res.json(article)
})

router.post('/', (req, res) => {
  const { title, content, author } = req.body

  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Champs manquants' })
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

module.exports = router