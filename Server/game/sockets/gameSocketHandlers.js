const socketManager = require("../managers/SocketManager");

const { socketLogger } = require("../../utils/logger");
const { verifyToken } = require("../../utils/jwt");
const waitingLobbyHandlers = require("./waitingLobbyHandlers");
const gameSocketController = require("../controllers/gameSocketController");

module.exports = function (io) {
    // middleware for socket message
    io.use((socket, next) => {
        try {
            const token = socket?.handshake?.auth?.token;
            if (token) {
                console.log("Token in middelware", token);
                console.log("is valid", verifyToken(token));
                const decoded = verifyToken(token); // verify jwt
                socket.user = decoded;
                next();
            }
        } catch (err) {
            console.log("Auth error");
            socket.emit("redirect_to_login");
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        waitingLobbyHandlers(io, socket);

        socketManager.register(socket, socket.user.username);

        // Log every incoming message
        socket.onAny((event, ...args) => {
            socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
        });

        socket.on("find_game", (args) => gameSocketController.handleJoinQueue(socket, args));

        socket.on("join_room", (args) => gameSocketController.handleJoinRoom(socket, args));

        socket.on("keeper_word_submission", (args) => {
            gameSocketController.handleKeeperWordSubmission(socket, args);
        });

        socket.on("submit_clue", (args) => gameSocketController.handleSubmitClue(socket, args));

        socket.on("submit_guess", (args) => gameSocketController.handleSubmitGuess(socket, args));

        socket.on("disconnect", (args) => {
            gameSocketController.disconnect(socket, args);
        });
    });
};
