const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')

// Récupere l'id de l'article
const router = express.Router({ mergeParams: true })

router.get('/', (req, res) => {
  const articleId = req.params.articleId
  const comments = db.comments.filter(c => c.articleId === articleId)
  res.json(comments)
})

router.post('/', (req, res) => {
  const articleId = req.params.articleId
  const article = db.articles.find(a => a.id === articleId)
  if (!article) {
    return res.status(404).json({ error: 'Article not found' })
  }

  const { content, author } = req.body
  if (!content || !author) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newComment = {
    id: uuidv4(),
    timestamp: Date.now(),
    content,
    articleId,
    author
  }

  db.comments.push(newComment)
  res.status(201).json(newComment)
})

router.get('/:commentId', (req, res) => {
  const { articleId, commentId } = req.params
  const comment = db.comments.find(
    c => c.articleId === articleId && c.id === commentId
  )

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' })
  }

  res.json(comment)
})

module.exports = router
