// WaitingLobbyManager.js
const waitingLobbies = {};

function createLobby(lobbyId, creatorUsername) {
  if (waitingLobbies[lobbyId]) return null;

  waitingLobbies[lobbyId] = {
    creator: creatorUsername,
    users: [creatorUsername],
    started: false
  };

  return waitingLobbies[lobbyId];
}

function joinLobby(lobbyId, username) {
  const lobby = waitingLobbies[lobbyId];
  if (lobby && !lobby.users.includes(username)) {
    lobby.users.push(username);
  }
}

function getLobbyUsers(lobbyId) {
  return waitingLobbies[lobbyId]?.users || [];
}

function startLobby(lobbyId) {
  waitingLobbies[lobbyId].started = true;
  return waitingLobbies[lobbyId];
}

function deleteLobby(lobbyId) {
  delete waitingLobbies[lobbyId];
}

module.exports = {
  createLobby,
  joinLobby,
  getLobbyUsers,
  startLobby,
  deleteLobby,
};
