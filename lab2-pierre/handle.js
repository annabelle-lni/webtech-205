// ./handles.js
// Necessary imports
module.exports = {
  serverHandle: function (req, res) {
    const url = require('url')
    const qs = require('querystring')
    const route = url.parse(req.url)
    const path = route.pathname 
    const params = qs.parse(route.query)
    
    res.writeHead(200, {'Content-Type': 'text/plain'})
    
    if (path === '/hello' && params.name === 'Alice') {
      res.write('Hello ' + params.name)
    } else if (path === '/hello' && params.name==='Pierre-Louis'){
      res.write('Hello' + params.name)
    } else {
        res.write('ERREUR 404, page non trouvee')
    }
      
    res.end()
  } 
}