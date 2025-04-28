const WaitingLobbyManager = require("../managers/WaitingLobbyManager");
const GameManager = require("../managers/GameManager");

module.exports = function waitingLobbyHandlers(io, socket) {
    socket.on("create_waiting_lobby", ({ lobbyId, username }) => {
        const lobby = WaitingLobbyManager.createLobby(
            lobbyId,
            username,
            socket.id
        );
        if (!lobby) {
            socket.emit("error_message", "Lobby already exists.");
            return;
        }

        socket.join(lobbyId);
        io.to(lobbyId).emit(
            "lobby_update",
            WaitingLobbyManager.getLobbyUsers(lobbyId)
        );
    });

    socket.on("join_waiting_lobby", ({ lobbyId, username }) => {
        isLobbyExist = WaitingLobbyManager.isLobbyExist(lobbyId);
        if (!isLobbyExist) {
            console.log("Lobby does not exist");
            socket.emit("error_message", "Lobby does not exist.");
            socket.emit("redirect_to_lobby");
            return;
        }
        socket.join(lobbyId);
        WaitingLobbyManager.joinLobby(lobbyId, username, socket.id);
        console.log("Found users", WaitingLobbyManager.getLobbyUsers(lobbyId));
        io.to(lobbyId).emit(
            "lobby_update",
            WaitingLobbyManager.getLobbyUsers(lobbyId)
        );
    });

    socket.on("get_lobby_users", ({ lobbyId }) => {
        socket.emit("lobby_update", WaitingLobbyManager.getLobbyUsers(lobbyId));
    });

    socket.on("leave_waiting_lobby", ({ lobbyId, username }) => {
        console.log(`${username} left lobby ${lobbyId}`);

        WaitingLobbyManager.leaveLobby(lobbyId, username);
        io.to(lobbyId).emit(
            "lobby_update",
            WaitingLobbyManager.getLobbyUsers(lobbyId)
        );
    });

    socket.on("start_game_from_lobby", ({ lobbyId }) => {
        const lobby = WaitingLobbyManager.startLobby(lobbyId);
        if (!lobby || lobby.users.length < 3) {
            socket.emit("error_message", "Not enough users to start the game.");
            return;
        }

        const keeper = lobby.creator;
        const seekers = lobby.users.filter((u) => u !== keeper);
        const room = GameManager.createRoom("Started", keeper, seekers);

        io.to(lobbyId).emit("game_started", { roomId: room.roomId });
        WaitingLobbyManager.deleteLobby(lobbyId);
    });
};
