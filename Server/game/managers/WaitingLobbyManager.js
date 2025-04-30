const socketManager = require("../managers/SocketManager");

class WaitingLobbyManager {
    constructor() {
        this.waitingLobbies = {};
    }

    createLobby(lobbyId, creatorUsername, socketId) {
        if (this.waitingLobbies[lobbyId]) return null;

        console.log("new room created: ", lobbyId, "by ", creatorUsername);
        this.waitingLobbies[lobbyId] = {
            creator: creatorUsername,
            users: new Set([creatorUsername]),
            started: false,
        };

        return this.waitingLobbies[lobbyId];
    }

    isLobbyExist(lobbyId) {
        return this.waitingLobbies[lobbyId] !== undefined;
    }

    getLobby(lobbyId) {
        console.log("in get lobby");
        this.printWaitingLobbies();
        return this.waitingLobbies[lobbyId];
    }

    joinLobby(lobbyId, username, socketId) {
        console.log(
            "trying to join the lobby ",
            lobbyId,
            "with user ",
            username
        );
        this.printWaitingLobbies();
        const lobby = this.waitingLobbies[lobbyId];
        if (lobby) {
            const alreadyActive =
                lobby.users.has(username) &&
                socketManager.isConnected(username);

            if (!alreadyActive) {
                lobby.users.add(username);
            }
        }
    }

    getLobbyUsers(lobbyId) {
        const lobby = this.waitingLobbies[lobbyId];
        return lobby ? Array.from(lobby.users) : [];
    }

    getAllLobbies() {
        return this.waitingLobbies;
    }

    leaveLobby(lobbyId, username) {
        const lobby = this.waitingLobbies[lobbyId];
        if (lobby) {
            const existed = lobby.users.has(username);

            if (existed) {
                lobby.users.delete(username);

                if (lobby.users.size === 0) {
                    delete this.waitingLobbies[lobbyId];
                }

                return true;
            }
        }
        return false;
    }

    deleteLobby(lobbyId) {
        delete this.waitingLobbies[lobbyId];
    }

    printWaitingLobbies() {
        console.log("📦 Current Waiting Lobbies:");
        if (Object.keys(this.waitingLobbies).length === 0) {
            console.log("🕳️ No active lobbies.");
            return;
        }

        for (const lobbyId in this.waitingLobbies) {
            const lobby = this.waitingLobbies[lobbyId];
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

    removeUserFromItsLobbies(socketId) {
        const username = socketManager.getUsernameBySocketId(socketId);
        const lobbies = [];
        if (!username) {
            console.log(`No username found for socket ${socketId}`);
            return;
        }

        console.log(`Removing user ${username} from all lobbies...`);

        for (const lobbyId in this.waitingLobbies) {
            const lobby = this.waitingLobbies[lobbyId];
            if (lobby.users.has(username)) {
                if (this.leaveLobby(lobbyId, username)) lobbies.push(lobbyId);
            }
        }
        return lobbies;
    }
}

// Export singleton
module.exports = new WaitingLobbyManager();
