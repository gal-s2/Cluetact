const WaitingRoomManager = require("../managers/WaitingRoomManager");
const GameManager = require("../managers/GameManager");
const messageEmitter = require("../sockets/MessageEmitter");
const SOCKET_EVENTS = require("../../common/socketEvents.json");
const socketManager = require("../managers/SocketManager");

module.exports = function waitingRoomHandlers(io, socket) {
    socket.on(SOCKET_EVENTS.CLIENT_CREATE_WAITING_ROOM, ({ waitingRoomId, username }) => {
        const waitingRoom = WaitingRoomManager.createWaitingRoom(waitingRoomId, username, socket.id);
        if (!waitingRoom) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.ERROR_MESSAGE, "Waitimng room already exists.", socket);
            return;
        }

        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            { users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId), host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host },
            waitingRoomId
        );
    });

    socket.on(SOCKET_EVENTS.CLIENT_JOIN_WAITING_ROOM, ({ waitingRoomId, username }) => {
        const isWaitingRoomExist = WaitingRoomManager.isWaitingRoomExist(waitingRoomId);
        if (!isWaitingRoomExist) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Waiting room does not exist.", socket);
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }

        WaitingRoomManager.joinWaitingRoom(waitingRoomId, username, socket.id);

        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            { users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId), host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host },
            waitingRoomId
        );
    });

    socket.on(SOCKET_EVENTS.CLIENT_GET_WAITING_ROOM_USERS, ({ waitingRoomId }) => {
        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            { users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId), host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host },
            waitingRoomId
        );
    });

    socket.on(SOCKET_EVENTS.CLIENT_LEAVE_WAITING_ROOM, ({ waitingRoomId, username }) => {
        WaitingRoomManager.leaveWaitingRoom(waitingRoomId, username);
        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            { users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId), host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host },
            waitingRoomId
        );
    });

    socket.on(SOCKET_EVENTS.CLIENT_START_GAME_FROM_WAITING_ROOM, async ({ waitingRoomId }) => {
        const waitingRoom = WaitingRoomManager.getWaitingRoom(waitingRoomId);
        if (!waitingRoom || waitingRoom.users.length < 3) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.ERROR_MESSAGE, "Not enough users to start the game.", socket);
            return;
        }

        const keeperUsername = waitingRoom.host;
        const seekersUsernames = [...waitingRoom.users].filter((u) => u !== keeperUsername);
        console.log("keeper username: ", keeperUsername);
        const keeper = await socketManager.getUserByUsername(keeperUsername);
        const seekers = await Promise.all(seekersUsernames.map((username) => socketManager.getUserByUsername(username)));
        console.log("keeper: ", keeper, " seekers are:", seekers);
        const room = GameManager.createRoom(keeper, seekers);
        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, { roomId: room.roomId }, waitingRoomId);
        WaitingRoomManager.deleteWaitingRoom(waitingRoomId);
    });
};
