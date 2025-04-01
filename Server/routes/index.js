const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Room = require('../game/Room.js'); // Adjust path based on your structure

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Cluetact server is running');
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Example event handlers
  socket.on('joinRoom', (data) => {
    console.log(`${data.username} joined room ${data.roomId}`);
    // Add your Room handling logic here
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(` Server listening at http://localhost:${PORT}`);
});
