const express = require("express");
require("dotenv").config();
require("./config/mongo");
//require("./jobs/deleteOldGuests"); // Were removing this for production for now

const PORT = process.env.PORT || 8000;
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { requestLogger } = require("./utils/logger.js");

process.on("uncaughtException", (err) => {
    console.error("🧨 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection:", reason);
});

//app.use(helmet());
app.use(
    cors({
        origin: [
            "https://cluetact.onrender.com", //#client-url
            "https://thankful-field-0e225591e.2.azurestaticapps.net",
            "http://localhost", // port 80
            "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json());
app.use((req, res, next) => {
    requestLogger.info(`${req.method} ${req.url}`);
    next();
});

app.use(require("./api/routes/router.js"));

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

require("./sockets/socketServer.js")(io);

app.use((req, res) => {
    console.log("🚨 Unmatched route:", req.method, req.url);
    res.status(404).send("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on port ${PORT}`);
});
