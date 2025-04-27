const waitingLobbies = {};
const socketManager = require("../managers/globalSocketManager");

function createLobby(lobbyId, creatorUsername, socketId) {
    if (waitingLobbies[lobbyId]) return null;

    console.log("new room created: ", lobbyId, "by ", creatorUsername);
    waitingLobbies[lobbyId] = {
        creator: creatorUsername,
        users: new Set([creatorUsername]),
        started: false,
    };

    return waitingLobbies[lobbyId];
}

function isLobbyExist(lobbyId) {
    return waitingLobbies[lobbyId] !== undefined;
}

function joinLobby(lobbyId, username, socketId) {
    console.log("trying to join the lobby ", lobbyId, "with user ", username);
    printWaitingLobbies();
    const lobby = waitingLobbies[lobbyId];
    if (lobby) {
        const alreadyActive =
            lobby.users.has(username) && socketManager.isConnected(username);

        if (!alreadyActive) {
            lobby.users.add(username);
        }
    }
}

function getLobbyUsers(lobbyId) {
    const lobby = waitingLobbies[lobbyId];
    return lobby ? Array.from(lobby.users) : [];
}

// Optional helper for debugging
function getAllLobbies() {
    return waitingLobbies;
}

function leaveLobby(lobbyId, username) {
    const lobby = waitingLobbies[lobbyId];
    if (lobby) {
        const existed = lobby.users.has(username);

        if (existed) {
            lobby.users.delete(username);

            if (lobby.users.size === 0) {
                delete waitingLobbies[lobbyId];
            }

            return true;
        }
    }
    return false;
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
        let i = 1;
        lobby.users.forEach((username) => {
            console.log(`   ${i}. ${username}`);
            i++;
        });
        console.log("─────────────────────────────");
    }
}

function removeUserFromItsLobbies(socketId) {
    const username = socketManager.getUsernameBySocketId(socketId);
    const lobbies = [];
    if (!username) {
        console.log(`No username found for socket ${socketId}`);
        return;
    }

    console.log(`Removing user ${username} from all lobbies...`);

    for (const lobbyId in waitingLobbies) {
        const lobby = waitingLobbies[lobbyId];
        if (lobby.users.has(username)) {
            if (leaveLobby(lobbyId, username)) lobbies.push(lobbyId);
        }
    }
    return lobbies;
}

module.exports = {
    createLobby,
    joinLobby,
    getLobbyUsers,
    getAllLobbies,
    printWaitingLobbies,
    leaveLobby,
    isLobbyExist,
    removeUserFromItsLobbies,
};
