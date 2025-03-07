const express = require('express');
const mongoose = require('mongoose');
const GameFactory = require('./game/GameFactory');
const Room = require('./game/Room');

// Connect to dbs
//require('./config/redis');

require('./config/mongo');

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
gameFactory.addUserToQueue(1);
gameFactory.addUserToQueue(2);
gameFactory.addUserToQueue(3);

console.log(gameFactory.rooms);