const express = require('express');
const mongoose = require('mongoose');
const redis = require('./config/redis');
const GameFactory = require('./game/GameFactory');
const Room = require('./game/Room');



mongoose.connect('mongodb://localhost:27017/');

const app = express();

app.use(express.json());

// Import enviroment variables file
require('dotenv').config()

const PORT = process.env.PORT || 8000;


// Import all routers from ./routes/index.js
app.use(require('./routes'));

// Server listens on enviroment defined port
app.listen(PORT, () => {
    console.log(`Cluetact Server is running on port ${PORT}`);
});

const gameFactory = new GameFactory();
const room1 = gameFactory.createRoom("start",1,[2,3,4]);
console.log(gameFactory.rooms);
gameFactory.getRoom(1).updateStatus("in progress");