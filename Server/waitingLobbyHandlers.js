// /socket/waitingLobbyHandlers.js

const WaitingLobbyManager = require("./WaitingLobbyManager");
const GameManager = require("./game/GameManager");

module.exports = function waitingLobbyHandlers(io, socket) {
  socket.on("create_waiting_lobby", ({ lobbyId, username }) => {
    const lobby = WaitingLobbyManager.createLobby(lobbyId, username);
    if (!lobby) {
      socket.emit("error_message", "Lobby already exists.");
      return;
    }

    socket.join(lobbyId);
    io.to(lobbyId).emit("lobby_update", lobby.users);
  });

  socket.on("join_waiting_lobby", ({ lobbyId, username }) => {
    WaitingLobbyManager.joinLobby(lobbyId, username);
    socket.join(lobbyId);
    io.to(lobbyId).emit("lobby_update", WaitingLobbyManager.getLobbyUsers(lobbyId));
  });

  socket.on("start_game_from_lobby", ({ lobbyId }) => {
    const lobby = WaitingLobbyManager.startLobby(lobbyId);
    if (!lobby || lobby.users.length < 3) {
      socket.emit("error_message", "Not enough users to start the game.");
      return;
    }

    const keeper = lobby.creator;
    const seekers = lobby.users.filter(u => u !== keeper);
    const room = GameManager.createRoom("Started", keeper, seekers);

    io.to(lobbyId).emit("game_started", { roomId: room.roomId });
    WaitingLobbyManager.deleteLobby(lobbyId);
  });
};
