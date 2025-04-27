const express = require("express");

//test words api
//const { getNounsByMeaning,getNounsByPrefix,testWordUtils } = require('./game/wordUtils');
//testWordUtils();

// Import enviroment variables file
require("dotenv").config();

// Connect to dbs
//require('./config/redis');
require("./config/mongo");

const PORT = process.env.PORT || 8000;
const app = express();
const cors = require("cors");
const { requestLogger } = require("./utils/logger.js");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    requestLogger.info(`${req.method} ${req.url}`);
    next();
});

// Import all routers from ./routes/index.js
app.use(require("./routes"));
app.use("/api/stats", require("./routes/stats"));

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

require("./game/sockets/gameSocketHandlers.js")(io);

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
