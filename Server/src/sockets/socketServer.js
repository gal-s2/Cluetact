const requireAuth = require("./middleware/requireAuth");
const connectionHandler = require("./handlers/connectionHandler");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

function initSocketServer(io) {
    io.use(requireAuth);
    io.on(SOCKET_EVENTS.CONNECTION, (socket) => connectionHandler(io, socket));
}

module.exports = initSocketServer;
