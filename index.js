// Import a module
const http = require('http')
const handles =require('./handles.js')

http
.createServer(handles.serverHandle)
.listen(8080)