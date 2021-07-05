
const  { createServer } = require('http');
const express = require('express');
const path = require('path');
const clients = {};
const WebSocket = require('ws');

const chatData = {
    "default": "Welcome to Tara <br> 1.Digital Textbook, <br>2.Course, <br>3.Others",
    "one": "What content would you like to explore? <br>1.Textbook videos, <br>2.Critical Thinking",
    "two": "Select what you are looking for <br>1.Take Course, <br>2. Help for Course"
}

const app = express();
app.use(express.static(path.join(__dirname, '/')));
app.get('/', function(request, response){
    response.sendFile('/index.html');
});

app.all('/chat/:token', function(request, response){
    let id = request.url.substring(request.url.lastIndexOf('/') + 1);
    console.log(":/token endpoint url param id = ", id);
    response.send({data: "success", token: id});
})

const server = createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1);
    if ('' === id) {
        //connecting id is missing
        ws.terminate();

        return;
    }
    if ('undefined' === typeof clients[id]) {
        clients[id] = [];
    }
    console.log('Connection Received from IP: ' + req.socket.remoteAddress + ' with id ' + id);

    //append websocket client to list of clients
    // console.log(ws);
    clients[id].push(ws);

    ws.on('message', function incoming(message) {
        if ('' === message) {
            //skip if message is blank
            return;
        }

        try {
            //process message as JSON object as "{"message": "string", "token": "string"}"
            message = JSON.parse(message);
        } catch(e) {
            return;
        }

        if (!message.hasOwnProperty('token') || '' === message.token) {
            //token was not sent or is empty
            return;
        }
        let token = message.token;
        console.log('Message received for token ' + token);

        if ('undefined' !== typeof clients[token] && clients[token]) {
            clients[token].forEach(function(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    //do not send message back to the sending client
                    console.log('message.sending', message )
                    client.send(message.message + ' ' + token);
                }
            });
        }

        //inform sending client message was sent
        // let welcomeMsg = `Welcome ${message.token} to ${message.message}`;
        let reply = chatData['default'];
        if(message.message == '1') reply = chatData['one']
        else if(message.message == '2') reply = chatData['two']

        message.reply = reply;
        console.log("message sending", message);
        ws.send(JSON.stringify(message));
    });

    ws.on('close', function() {
        clients[id].forEach(function(client, index) {
            if (client === ws) {
                //remove the client from the pool
                console.log('Closing ws connection for token - ', clients[id])
                clients[id].splice(index, 1);
            }
        });
    });
});

server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});