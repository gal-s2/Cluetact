const SOCKET_EVENTS = require("@shared/socketEvents.json");
const overwatchController = require("../controllers/overwatchController");

function bindOverWatchEvents(socket) {
    socket.on(SOCKET_EVENTS.CLIENT_GET_ONLINE_ROOMS, () => overwatchController.handleGetOnlineRooms(socket));
    socket.on(SOCKET_EVENTS.CLIENT_GET_ONLINE_WAITING_ROOMS, () => overwatchController.handleGetOnlineWaitingRooms(socket));
    socket.on(SOCKET_EVENTS.CLIENT_GET_ALL_USERS, () => overwatchController.handleGetAllUsers(socket));
}

module.exports = bindOverWatchEvents;
