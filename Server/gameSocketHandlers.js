const GameManager = require("./game/GameManager");
const SocketManager = require("./game/SocketManager");

const { socketLogger } = require("./utils/logger");
const { verifyToken } = require("./utils/jwt");
const waitingLobbyHandlers = require("./waitingLobbyHandlers");
const {
    handleJoinQueue,
    handleJoinRoom,
    handleKeeperWordSubmission,
    disconnect,
} = require("./gameSocketController");

module.exports = function (io) {
    const gameManager = new GameManager();
    const socketManager = new SocketManager();

    // middleware for socket message
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const decoded = verifyToken(token); // verify jwt
            socket.user = decoded;
            next();
        } catch (err) {
            console.log("Auth error");
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        waitingLobbyHandlers(io, socket);

        socketManager.register(socket, socket.user.username);

        // Log every incoming message
        socket.onAny((event, ...args) => {
            socketLogger.info(
                `[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(
                    args
                )}`
            );
        });

        socket.on("find_game", (args) =>
            handleJoinQueue(socket, args, {
                gameManager,
                socketManager,
            })
        );

        socket.on("join_room", (args) =>
            handleJoinRoom(socket, args, {
                gameManager,
                socketManager,
            })
        );

        socket.on("keeper_word_submission", (args) => {
            handleKeeperWordSubmission(socket, args, {
                gameManager,
                socketManager,
            });
        });

        socket.on("disconnect", (args) => {
            disconnect(socket, args, {
                gameManager,
                socketManager,
            });
        });
    });
};
