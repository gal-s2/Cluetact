const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

require('./gameSocketHandlers.js')(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
