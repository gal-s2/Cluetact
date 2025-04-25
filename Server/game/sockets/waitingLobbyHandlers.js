// /socket/waitingLobbyHandlers.js

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
        WaitingLobbyManager.printWaitingLobbies();
    });

    socket.on("join_waiting_lobby", ({ lobbyId, username }) => {
        socket.join(lobbyId);
        WaitingLobbyManager.joinLobby(lobbyId, username, socket.id);
        io.to(lobbyId).emit(
            "lobby_update",
            WaitingLobbyManager.getLobbyUsers(lobbyId)
        );
    });

    socket.on("get_lobby_users", ({ lobbyId }) => {
        socket.emit("lobby_update", WaitingLobbyManager.getLobbyUsers(lobbyId));
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

    socket.on("disconnect", () => {
        console.log("disconnectinggggg....");
        const lobbyId = WaitingLobbyManager.removeUserFromLobby(socket.id);
        if (lobbyId) {
            console.log(
                `[Socket ${socket.id}] disconnected. Updated lobby: ${lobbyId}`
            );
            socket.leave(lobbyId);
            io.to(lobbyId).emit(
                "lobby_update",
                WaitingLobbyManager.getLobbyUsers(lobbyId)
            );
        } else {
            console.log(
                `[Socket ${socket.id}] disconnected. Not part of any waiting lobby.`
            );
        }
    });
};
