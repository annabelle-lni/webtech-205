const express = require('express')
const app = express()
const routes = require('./routes')

app.use(express.json())

app.use('/', routes)

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Serveur: http://localhost:${PORT}`)
})
