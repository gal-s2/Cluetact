const socketManager = require("../managers/SocketManager");

const { socketLogger } = require("../../utils/logger");
const { verifyToken } = require("../../utils/jwt");
const waitingLobbyHandlers = require("../controllers/waitingLobbyHandlers");
const gameEventsHandlers = require("../controllers/gameEventsHandlers");
const overWatchHandlers = require("../controllers/overWatchHandlers");
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
            } else {
                next(new Error("Missing auth token"));
            }
        } catch (err) {
            next(new Error("Auth error"));
        }
    });

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log("[Client connected:", socket.id, "]");
        waitingLobbyHandlers(io, socket);

        socketManager.register(socket, socket.user.username);

        const reconnect = (socket) => {
            let roomId = GameManager.getRoomIdByUsername(socket?.user?.username);
            if (roomId) messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, { roomId }, socket);
        };

        // Log every incoming message
        socket.onAny((event, ...args) => {
            socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
        });

        socket.on(SOCKET_EVENTS.CLIENT_NOTIFY_MY_SOCKET_IS_READY, () => {
            reconnect(socket);
        });

        socket.on(SOCKET_EVENTS.CLIENT_FIND_GAME, (args) => gameEventsHandlers.handleJoinQueue(socket, args));

        socket.on(SOCKET_EVENTS.CLIENT_JOIN_ROOM, (args) => gameEventsHandlers.handleJoinRoom(socket, args));

        socket.on(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, (args) => gameEventsHandlers.handleKeeperWordSubmission(socket, args));

        socket.on(SOCKET_EVENTS.CLIENT_SUBMIT_CLUE, (args) => gameEventsHandlers.handleSubmitClue(socket, args));

        socket.on(SOCKET_EVENTS.CLIENT_TRY_CLUETACT, (args) => gameEventsHandlers.handleTryCluetact(socket, args));
        socket.on(SOCKET_EVENTS.CLIENT_TRY_BLOCK_CLUE, (args) => gameEventsHandlers.handleTryBlockClue(socket, args));

        socket.on(SOCKET_EVENTS.CLIENT_EXIT_ROOM, () => gameEventsHandlers.handleExitRoom(socket));

        socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            gameEventsHandlers.disconnect(socket, reason);
        });

        socket.on(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, () => overWatchHandlers.handleGetOnlineRooms(socket));
        socket.on(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, () => overWatchHandlers.handleGetAllUsers(socket));
    });
};
