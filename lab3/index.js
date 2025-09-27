const express = require('express')
const app = express()
const port = 3000

const birds = require('./birds')

app.use(express.json())

app.use('/birds', birds)

app.get('/', (req, res) => {
  res.send('Hello from main app')
})

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`)
})
