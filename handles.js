const url = require('url')
const qs = require('querystring')
const aboutContent = require('./content/about.json')

module.exports = {
    serverHandle: function (req, res) {
        const route = url.parse(req.url)
        const path = route.pathname 
        const params = qs.parse(route.query)
        
        if(path === '/'){
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write('<h1>Bienvenue</h1>')
            res.write(`<p>Entrer /hello suivi du nom Pierre-Louis pour pouvoir acceder au "site"</p>`)
            res.end()
        }else if (path === '/hello') {
            if(!params.name){
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write('Bonjour monsieur anonyme')
            }else if(params.name === 'Pierre-Louis'){
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write('Hello Pierre-Louis ')
                res.write('Je suis etudiant a l ece')
            }else {
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write(`<p>Hello ${params.name} </p>`)
            }
            res.end()

        } else if(path === '/about'){
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.write(JSON.stringify(aboutContent))
            res.end()

        }else {
            res.writeHead(404)
            res.write('<h1>Page non trouvée</h1>')
            res.end()
        }
    }
}