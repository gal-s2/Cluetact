const express = require("express");
require("dotenv").config();
require("./config/mongo");

const PORT = process.env.PORT || 8000;
const app = express();
const cors = require("cors");
const { requestLogger } = require("./utils/logger.js");

process.on("uncaughtException", (err) => {
    console.error("🧨 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection:", reason);
});

app.use(
    cors({
        origin: [
            "https://cluetact.onrender.com", //#client-url
            "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PATCH"],
        credentials: true,
    })
);
app.use(express.json());
app.use((req, res, next) => {
    requestLogger.info(`${req.method} ${req.url}`);
    next();
});

app.use(require("./routes/router.js"));

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

require("./game/sockets/socketServer.js")(io);

app.use((req, res) => {
    console.log("🚨 Unmatched route:", req.method, req.url);
    res.status(404).send("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on port ${PORT}`);
});
