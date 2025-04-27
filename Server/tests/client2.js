const io = require('socket.io-client');
const prompt = require("prompt-sync")();
const socket = io('http://localhost:8000'); 

const username = 'Bob12223'; 

socket.on('connect', async () => {
    console.log('You connected to the server');
    socket.emit('joinRoom', { username }); 
});

socket.on('disconnect', async () => {
    console.log('You disconnected from server');
});
