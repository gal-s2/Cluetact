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

app.use(
    cors({
        origin: [
            "https://e97b-95-35-191-50.ngrok-free.app", // Frontend Ngrok URL
        ],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
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

require("./game/sockets/socketServer.js")(io);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on port ${PORT}`);
});
