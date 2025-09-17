// Import a module
const http = require('http')
const handle = require('./handle')

// Declare an http server
http.createServer(function (req, res) {

  // Write a response header
  res.writeHead(200, {'Content-Type': 'text/plain'})

  // Write a response content
  res.end('Hello World\n')
  

// Start the server
})

// Define a string constant concatenating strings
const content = '<!DOCTYPE html>' +
'<html>' +
'    <head>' +
'        <meta charset="utf-8" />' +
'        <title>ECE AST</title>' +
'    </head>' + 
'    <body>' +
'       <p>Hello World!</p>' +
'    </body>' +
'</html>'

http
.createServer(handle.serverHandle)
.listen(8080)