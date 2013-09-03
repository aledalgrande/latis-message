var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	inbox = require("inbox"),
	MailParser = require("mailparser").MailParser,
	mailparser = new MailParser();

var clients = {};

var client = inbox.createConnection(false, "imap.gmail.com", {
	secureConnection: true,
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});

client.on("connect", function() {
	console.log("Successfully connected to the GMail server");
	client.openMailbox("INBOX", function(error, info) {
		if (error) throw error;
		console.log("Message count in INBOX: " + info.count);
	});
});

client.on("new", function(message) {
	var messageStream = client.createMessageStream(message.UID).pipe(mailparser);

	mailparser.on("end", function(mail_object) {
		var from = mail_object.from,
			email = from.address,
			name = from.email,
			channel_id = mail_object.subject,
			body = mail_object.text,
			channel = clients[channel_id];

		if (channel)
			channel.emit("message", { email: email, name: name, message: body });
		
		mailparser = new MailParser();
	});

	
});

client.connect();

io.sockets.on("connection", function(socket) { 
	// new client is here!
	clients[socket.id] = socket;

	socket.on("message", function(data){ 
		socket.emit("message", {message: "received " + data.message});
		// send email
	});

});

server.listen(8090);