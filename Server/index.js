const express = require('express');

// Import enviroment variables file
require('dotenv').config();

// Connect to dbs
//require('./config/redis');
require('./config/mongo');

const PORT = process.env.PORT || 8000;
const app = express();
const cors = require('cors');
const { requestLogger } = require("./logger");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    requestLogger.info(`${req.method} ${req.url}`);
    next();
});

// Import all routers from ./routes/index.js
app.use(require('./routes'));

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
    console.log('connected! ', socket.id);  // This should print on the server when a client connects.

    socket.on('set_keeper_word', ({ roomId, word }) => {
        console.log('keeper set word' + word);
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
    });
});

// Start the server on port
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});