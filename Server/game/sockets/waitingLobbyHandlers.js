const waitingLobbyManager = require("../managers/WaitingLobbyManager");
const GameManager = require("../managers/GameManager");
const messageEmitter = require("./MessageEmitter");
const SOCKET_EVENTS = require("../../../shared/socketEvents.json");

module.exports = function waitingLobbyHandlers(io, socket) {
    socket.on(SOCKET_EVENTS.CLIENT_CREATE_WAITING_LOBBY, ({ lobbyId, username }) => {
        const lobby = waitingLobbyManager.createLobby(lobbyId, username, socket.id);
        if (!lobby) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.ERROR_MESSAGE, "Lobby already exists.", socket);
            return;
        }

        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on(SOCKET_EVENTS.CLIENT_JOIN_WAITING_LOBBY, ({ lobbyId, username }) => {
        isLobbyExist = waitingLobbyManager.isLobbyExist(lobbyId);
        if (!isLobbyExist) {
            console.log("Lobby does not exist");
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Lobby does not exist.", socket);
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }

        waitingLobbyManager.joinLobby(lobbyId, username, socket.id);
        console.log("Found users", waitingLobbyManager.getLobbyUsers(lobbyId));

        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on(SOCKET_EVENTS.CLIENT_GET_LOBBY_USERS, ({ lobbyId }) => {
        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on(SOCKET_EVENTS.CLIENT_LEAVE_WAITING_LOBBY, ({ lobbyId, username }) => {
        console.log(`${username} left lobby ${lobbyId}`);

        waitingLobbyManager.leaveLobby(lobbyId, username);
        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on(SOCKET_EVENTS.CLIENT_START_GAME_FROM_LOBBY, ({ lobbyId }) => {
        const lobby = waitingLobbyManager.getLobby(lobbyId);
        console.log("looking for lobby", lobbyId);
        if (!lobby || lobby.users.length < 3) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.ERROR_MESSAGE, "Not enough users to start the game.", socket);
            return;
        }

        const keeper = lobby.creator;
        const seekers = [...lobby.users].filter((u) => u !== keeper);
        const room = GameManager.createRoom(keeper, seekers);

        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, { roomId: room.roomId }, lobbyId);
        waitingLobbyManager.deleteLobby(lobbyId);
    });
};
