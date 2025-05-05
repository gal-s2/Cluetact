const waitingLobbyManager = require("../managers/WaitingLobbyManager");
const GameManager = require("../managers/GameManager");
const messageEmitter = require("./MessageEmitter");

module.exports = function waitingLobbyHandlers(io, socket) {
    socket.on("create_waiting_lobby", ({ lobbyId, username }) => {
        const lobby = waitingLobbyManager.createLobby(lobbyId, username, socket.id);
        if (!lobby) {
            messageEmitter.emitToSocket("error_message", "Lobby already exists.", socket);
            return;
        }

        messageEmitter.broadcastToWaitingRoom("lobby_update", waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on("join_waiting_lobby", ({ lobbyId, username }) => {
        isLobbyExist = waitingLobbyManager.isLobbyExist(lobbyId);
        if (!isLobbyExist) {
            console.log("Lobby does not exist");
            messageEmitter.emitToSocket("error_message", "Lobby does not exist.", socket);
            messageEmitter.emitToSocket("redirect_to_lobby", null, socket);
            return;
        }

        waitingLobbyManager.joinLobby(lobbyId, username, socket.id);
        console.log("Found users", waitingLobbyManager.getLobbyUsers(lobbyId));

        messageEmitter.broadcastToWaitingRoom("lobby_update", waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on("get_lobby_users", ({ lobbyId }) => {
        messageEmitter.broadcastToWaitingRoom("lobby_update", waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on("leave_waiting_lobby", ({ lobbyId, username }) => {
        console.log(`${username} left lobby ${lobbyId}`);

        waitingLobbyManager.leaveLobby(lobbyId, username);
        messageEmitter.broadcastToWaitingRoom("lobby_update", waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
    });

    socket.on("start_game_from_lobby", ({ lobbyId }) => {
        const lobby = waitingLobbyManager.getLobby(lobbyId);
        console.log("looking for lobby", lobbyId);
        if (!lobby || lobby.users.length < 3) {
            messageEmitter.emitToSocket("error_message", "Not enough users to start the game.", socket);
            return;
        }

        const keeper = lobby.creator;
        const seekers = [...lobby.users].filter((u) => u !== keeper);
        const room = GameManager.createRoom("Started", keeper, seekers);

        messageEmitter.broadcastToWaitingRoom("game_started", { roomId: room.roomId }, lobbyId);
        waitingLobbyManager.deleteLobby(lobbyId);
    });
};
