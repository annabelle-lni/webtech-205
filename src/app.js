const express = require('express')
const app = express()
const routes = require('./routes')
const articlesRoute = require('./routes/articles')

app.use(express.json())

app.use('/articles', articlesRoute)
app.use('/', routes)

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Serveur: http://localhost:${PORT}`)
})
