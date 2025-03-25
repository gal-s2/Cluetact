const express = require('express');
const mongoose = require('mongoose');
const GameFactory = require('./game/GameFactory');
const Room = require('./game/Room');

// Connect to dbs
//require('./config/redis');
require('./config/mongo');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Import enviroment variables file
require('dotenv').config()

const PORT = process.env.PORT || 8000;

// Import all routers from ./routes/index.js
app.use(require('./routes'));

// Server listens on enviroment defined port
// app.listen(PORT, () => {
//     console.log(`Cluetact Server is running on port ${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cluetact Server is running on port ${PORT}`);
});

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('connected! ', socket.id);

    socket.on('set_keeper_word', ({roomId, word}) => {
        console.log('keeper set word');
    })

    socket.on('disconnect', () => {
        console.log('disconnect');
    })
})

const gameFactory = new GameFactory();
gameFactory.addUserToQueue(1);
gameFactory.addUserToQueue(2);
gameFactory.addUserToQueue(3);

console.log(gameFactory.rooms);