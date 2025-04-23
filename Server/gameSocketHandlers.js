// gameSocketHandlers.js
const GameManager = require("./game/GameManager");
const { socketLogger } = require("./utils/logger");
const { verifyToken } = require("./utils/jwt");
const waitingLobbyHandlers = require("./waitingLobbyHandlers");
const {
    handleJoinQueue,
    handleJoinRoom,
    handleKeeperWordSubmission,
    disconnect,
} = require("./gameSocketController");

const socketUsernameMap = new Map(); // socket.id → username
const usernameSocketMap = new Map(); // username → socket


module.exports = function (io) {
    const game = new GameManager();

    // middleware for socket message.
    // checks if jwt is valid
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const decoded = verifyToken(token);
            socket.user = decoded; // { userId, username }
            next();
        } catch (err) {
            console.log("Auth error");
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        waitingLobbyHandlers(io, socket);

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
                game,
                socketUsernameMap,
                usernameSocketMap,
            })
        );

        socket.on("join_room", (args) =>
            handleJoinRoom(socket, args, {
                game,
                socketUsernameMap,
                usernameSocketMap,
            })
        );

        socket.on("keeper_word_submission", (data) => {
            handleKeeperWordSubmission(socket, data, {
                game,
                socketUsernameMap,
                usernameSocketMap,
            });
        });

        socket.on("disconnect", (args) =>
            disconnect(socket, args, { socketUsernameMap, usernameSocketMap })
        );

        
    });
};
