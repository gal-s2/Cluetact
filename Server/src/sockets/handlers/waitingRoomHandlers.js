const SOCKET_EVENTS = require("@shared/socketEvents.json");
const waitingRoomController = require("../controllers/waitingRoomController");

function bindWaitingRoomEvents(socket) {
    socket.on("disconnect", () => waitingRoomController.handleDisconnect(socket));
    socket.on(SOCKET_EVENTS.CLIENT_CREATE_WAITING_ROOM, (data) => waitingRoomController.handleCreateWaitingRoom(socket, data));
    socket.on(SOCKET_EVENTS.CLIENT_JOIN_WAITING_ROOM, (data) => waitingRoomController.handleJoinWaitingRoom(socket, data));
    socket.on(SOCKET_EVENTS.CLIENT_GET_WAITING_ROOM_USERS, (data) => waitingRoomController.handleGetWaitingRoomUsers(socket, data));
    socket.on(SOCKET_EVENTS.CLIENT_LEAVE_WAITING_ROOM, (data) => waitingRoomController.handleLeaveWaitingRoom(socket, data));
    socket.on(SOCKET_EVENTS.CLIENT_START_GAME_FROM_WAITING_ROOM, (data) => waitingRoomController.handleStartGameFromWaitingRoom(socket, data));
}

module.exports = bindWaitingRoomEvents;
