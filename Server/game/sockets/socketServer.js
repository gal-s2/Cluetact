const socketManager = require("../managers/SocketManager");

const { socketLogger } = require("../../utils/logger");
const { verifyToken } = require("../../utils/jwt");
const waitingRoomHandlers = require("../controllers/waitingRoomHandlers");
const gameEventsHandlers = require("../controllers/gameEventsHandlers");
const overWatchHandlers = require("../controllers/overWatchHandlers");
const messageEmitter = require("./MessageEmitter");
const SOCKET_EVENTS = require("../../common/socketEvents.json");
const GameManager = require("../managers/GameManager");
const User = require("../../models/User");

module.exports = function (io) {
    // middleware for socket message
    io.use(async (socket, next) => {
        try {
            const token = socket?.handshake?.auth?.token;
            if (token) {
                const decoded = verifyToken(token);

                socket.user = decoded;
                next();
            } else {
                next(new Error("Authentication error: No token provided"));
            }
        } catch (err) {
            next(new Error(err.message || "Authentication error"));
        }
    });

    const validateUserExistence = async (socket) => {
        const exists = await User.userExists(socket.user.username);

        return exists;
    };

    // Register the connection event

    io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
        await validateUserExistence(socket).then((exists) => {
            if (!exists) {
                console.log("[Socket connection error: User does not exist]", socket.id);
                socket.emit(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOGIN, null);
                setTimeout(() => {
                    socket.disconnect();
                }, 100);
                return;
            }
        });

        console.log("[Client connected:", socket.id, "]");
        waitingRoomHandlers(io, socket);

        socketManager.register(socket, socket.user.username);

        const reconnect = async (socket) => {
            const valid = await validateUserExistence(socket);
            if (!valid) return;

            let roomId = GameManager.getRoomIdByUsername(socket?.user?.username);
            if (roomId) messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, { roomId }, socket);
        };

        console.log("[SERVER] Setting up listeners for socket id:", socket.id);

        // Log every incoming message
        socket.onAny((event, ...args) => {
            socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
        });

        socket.on(SOCKET_EVENTS.CLIENT_NOTIFY_MY_SOCKET_IS_READY, () => {
            reconnect(socket);
        });

        socket.on(SOCKET_EVENTS.CLIENT_CHECK_EVENTS_AVAILABILITY, () => messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, null, socket));

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

        socket.on(SOCKET_EVENTS.CLIENT_GET_ONLINE_WAITING_ROOMS, () => overWatchHandlers.handleGetOnlineWaitingRooms(socket));

        socket.on(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, () => overWatchHandlers.handleGetAllUsers(socket));

        messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, null, socket);
    });
};
