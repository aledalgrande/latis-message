var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

var clients = {};

io.sockets.on('connection', function(socket){ 
	// new client is here!
	clients[socket.id] = socket;

	socket.on('message', function(data){ 
		socket.emit('message', {message: 'received ' + data.message});
		// send email via sendgrid
	});

});

app.use(express.bodyParser());
app.post('/answer', function(req, res){
	var body = req.body;

	clients[body.id].emit('message', { message: body.message });
	res.send('')
});

server.listen(8090);