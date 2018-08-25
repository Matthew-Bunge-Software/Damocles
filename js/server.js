'use strict';var http = require('http');
var net = require('net');
var io = require('socket.io')(http);

var server = http.createServer(function (req, res) {
    return res.end();
}).listen(8080);

io.on('connection', function (socket) {
    console.log('A new WebSocket connection has been established');
});
//# sourceMappingURL=server.js.map