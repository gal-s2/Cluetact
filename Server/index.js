const express = require('express');

// Import enviroment variables file
require('dotenv').config();

// Connect to dbs
//require('./config/redis');
require('./config/mongo');

const http = require('http');
const { Server } = require('socket.io');
const app = express();
const cors = require('cors');

const { requestLogger } = require("./logger");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    requestLogger.info(`${req.method} ${req.url}`);
    next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

require('./gameSocketHandlers.js')(io);

// Import all routers from ./routes/index.js
app.use(require('./routes'));


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
