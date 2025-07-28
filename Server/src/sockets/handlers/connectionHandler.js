const socketManager = require("../../game/managers/SocketManager");
const { socketLogger } = require("../../utils/logger");
const gameEventsHandlers = require("../controllers/gameController");
const messageEmitter = require("../MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");
const GameManager = require("../../game/managers/GameManager");
const User = require("../../models/User");
const bindOverWatchEvents = require("./overwatchHandlers");
const bindGameEvents = require("./gameHandlers");
const bindWaitingRoomEvents = require("./waitingRoomHandlers");

async function validateUserExistence(socket) {
    const exists = await User.userExists(socket.user.username);
    return exists;
}

async function connectionHandler(io, socket) {
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

    socketManager.register(socket, socket.user.username);

    const reconnect = async (socket) => {
        const valid = await validateUserExistence(socket);
        if (!valid) return;

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

    socket.on(SOCKET_EVENTS.CLIENT_CHECK_EVENTS_AVAILABILITY, () => messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, null, socket));

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => gameEventsHandlers.disconnect(socket, reason));

    bindGameEvents(socket);
    bindOverWatchEvents(socket);
    bindWaitingRoomEvents(socket);

    messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, null, socket);
}

module.exports = connectionHandler;
