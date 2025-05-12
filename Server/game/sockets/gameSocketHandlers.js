const socketManager = require("../managers/SocketManager");

const { socketLogger } = require("../../utils/logger");
const { verifyToken } = require("../../utils/jwt");
const waitingLobbyHandlers = require("./waitingLobbyHandlers");
const gameSocketController = require("../controllers/gameSocketController");
const messageEmitter = require("./MessageEmitter");
const SOCKET_EVENTS = require("../../../shared/socketEvents.json");
const GameManager = require("../managers/GameManager");

module.exports = function (io) {
    // middleware for socket message
    io.use((socket, next) => {
        try {
            const token = socket?.handshake?.auth?.token;
            if (token) {
                const decoded = verifyToken(token); // verify jwt
                socket.user = decoded;
                next();
            }
        } catch (err) {
            console.log("Auth error");
            messageEmitter.emitToSocket(SOCKET_EVENTS.REDIRECT_TO_LOGIN, null, socket);
        }
    });

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log("[Client connected:", socket.id, "]");
        waitingLobbyHandlers(io, socket);

        socketManager.register(socket, socket.user.username);

        // Here need to check if player is already in room
        reconnect(socket);
        //

        // Log every incoming message
        socket.onAny((event, ...args) => {
            socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
        });

        socket.on(SOCKET_EVENTS.FIND_GAME, (args) => gameSocketController.handleJoinQueue(socket, args));

        socket.on(SOCKET_EVENTS.JOIN_ROOM, (args) => gameSocketController.handleJoinRoom(socket, args));

        socket.on(SOCKET_EVENTS.KEEPER_WORD_SUBMISSION, (args) => gameSocketController.handleKeeperWordSubmission(socket, args));

        socket.on(SOCKET_EVENTS.SUBMIT_CLUE, (args) => gameSocketController.handleSubmitClue(socket, args));

        socket.on(SOCKET_EVENTS.TRY_CLUETACT, (args) => gameSocketController.handleTryCluetact(socket, args));
        socket.on(SOCKET_EVENTS.TRY_BLOCK_CLUE, (args) => gameSocketController.handleTryBlockClue(socket, args));

        socket.on(SOCKET_EVENTS.DISCONNECT, (args) => gameSocketController.disconnect(socket, args));
    });

    const reconnect = (socket) => {
        let roomId = GameManager.getRoomIdByUsername(socket?.user?.username);
        if (roomId) messageEmitter.emitToSocket(SOCKET_EVENTS.REDIRECT_TO_ROOM, { roomId }, socket);
    };
};
