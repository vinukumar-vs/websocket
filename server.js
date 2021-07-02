'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(request, response){
    response.sendFile('./public/index.html');
});


// const botInput = async (req, res) => {
//     const ip = req.headers['x-forwarded-for'].split(',')[0].trim();
//     console.log(ip);
//     res.status(200).send({result: {response: "Success", data: 1}});
// }

// app.post('/botInput',  botInput);


const server = createServer(app);
// console.log(server);
const wss = new WebSocket.Server({ server }); //{ host: 'localhost', port: 8080, path: '/botInput'}

/**
 * WS library examples
 * Reference: https://github.com/websockets/ws/tree/master/examples/server-stats
 */
wss.on('connection', function (ws) {
  const id = setInterval(function () {
    // const ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    // console.log(ip);
    ws.send(JSON.stringify(process.memoryUsage()), function () {
      //
      // Ignore errors.
      //
    });
  }, 200);
  console.log('started client interval');

  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
  });
});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});