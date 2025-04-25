const waitingLobbies = {};
const socketManager = require("../managers/globalSocketManager");

// Create a new lobby
function createLobby(lobbyId, creatorUsername, socketId) {
    if (waitingLobbies[lobbyId]) return null;

    console.log("room created");
    waitingLobbies[lobbyId] = {
        creator: creatorUsername,
        users: [{ username: creatorUsername, socketId }],
        started: false,
    };

    return waitingLobbies[lobbyId];
}

// Join an existing lobby
function joinLobby(lobbyId, username, socketId) {
    const lobby = waitingLobbies[lobbyId];
    if (!lobby) return;

    const alreadyActive = lobby.users.some(
        (user) =>
            user.username === username &&
            socketManager.isConnected(user.username)
    );

    if (!alreadyActive) {
        lobby.users.push({ username, socketId });
    }
}

// Get list of usernames for a lobby
function getLobbyUsers(lobbyId) {
    const lobby = waitingLobbies[lobbyId];
    return lobby ? lobby.users.map((u) => u.username) : [];
}

// Optional helper for debugging
function getAllLobbies() {
    return waitingLobbies;
}

// Find a lobby that contains a user by their socketId
function findLobbyBySocketId(socketId) {
    for (const lobbyId in waitingLobbies) {
        const lobby = waitingLobbies[lobbyId];
        if (lobby.users.some((u) => u.socketId === socketId)) {
            return { lobbyId, lobby };
        }
    }
    return null;
}

function leaveLobby(lobbyId, username) {
    const lobby = waitingLobbies[lobbyId];
    if (lobby) {
        lobby.users = lobby.users.filter((user) => user !== username);

        // Optionally: if no users left, delete lobby
        if (lobby.users.length === 0) {
            delete waitingLobbies[lobbyId];
        }
    }
}

// Remove a user from a lobby by socketId
function removeUserFromLobby(socketId) {
    for (const lobbyId in waitingLobbies) {
        const lobby = waitingLobbies[lobbyId];
        const index = lobby.users.findIndex((u) => u.socketId === socketId);
        if (index !== -1) {
            lobby.users.splice(index, 1);

            // Delete the entire lobby if it's now empty
            if (lobby.users.length === 0) {
                delete waitingLobbies[lobbyId];
            }

            return lobbyId; // return the lobbyId we updated
        }
    }

    return null;
}

function printWaitingLobbies() {
    console.log("📦 Current Waiting Lobbies:");

    if (Object.keys(waitingLobbies).length === 0) {
        console.log("🕳️ No active lobbies.");
        return;
    }

    for (const lobbyId in waitingLobbies) {
        const lobby = waitingLobbies[lobbyId];
        console.log(`🔑 Lobby ID: ${lobbyId}`);
        console.log(`👤 Creator: ${lobby.creator}`);
        console.log(`🎮 Started: ${lobby.started}`);
        console.log(`👥 Users:`);
        lobby.users.forEach((user, index) => {
            console.log(
                `   ${index + 1}. ${user.username} (socket: ${user.socketId})`
            );
        });
        console.log("─────────────────────────────");
    }
}

module.exports = {
    createLobby,
    joinLobby,
    getLobbyUsers,
    getAllLobbies,
    findLobbyBySocketId,
    removeUserFromLobby,
    printWaitingLobbies,
    leaveLobby,
};
