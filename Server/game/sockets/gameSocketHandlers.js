const GameManager = require("../managers/GameManager");
const socketManager = require("../managers/globalSocketManager");

const { socketLogger } = require("../../utils/logger");
const { verifyToken } = require("../../utils/jwt");
const waitingLobbyHandlers = require("./waitingLobbyHandlers");
const { handleJoinQueue, handleJoinRoom, handleKeeperWordSubmission, disconnect } = require("../controllers/gameSocketController");

module.exports = function (io) {
    const gameManager = new GameManager();

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
            throw new Error("Unauthorized");
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
