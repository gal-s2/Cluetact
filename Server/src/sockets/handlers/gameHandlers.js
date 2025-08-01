const SOCKET_EVENTS = require("@shared/socketEvents.json");
const gameController = require("../controllers/gameController");

function bindGameEvents(socket) {
    socket.on(SOCKET_EVENTS.CLIENT_FIND_GAME, (args) => gameController.handleJoinQueue(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_LEAVE_QUEUE, () => gameController.handleLeaveQueue(socket));
    socket.on(SOCKET_EVENTS.CLIENT_JOIN_ROOM, (args) => gameController.handleJoinRoom(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, (args) => gameController.handleKeeperWordSubmission(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_SUBMIT_CLUE, (args) => gameController.handleSubmitClue(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_TRY_CLUETACT, (args) => gameController.handleTryCluetact(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_TRY_BLOCK_CLUE, (args) => gameController.handleTryBlockClue(socket, args));
    socket.on(SOCKET_EVENTS.CLIENT_EXIT_ROOM, () => gameController.handleExitRoom(socket));
}

module.exports = bindGameEvents;
