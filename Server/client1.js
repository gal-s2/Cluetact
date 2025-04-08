const io = require('socket.io-client');
const prompt = require("prompt-sync")();
const socket = io('http://localhost:8000'); 

const userId = 'u1';
const username = 'Alice';

socket.on('connect', async () => {
    console.log('you connected to the server');
    socket.emit('join_game', { userId, username });
  });

socket.on('disconnect', async () => {
  console.log('you disconnected from server');
});
