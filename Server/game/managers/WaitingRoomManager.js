const socketManager = require("./SocketManager");

class WaitingRoomManager {
    constructor() {
        this.waitingRooms = {};
    }

    createWaitingRoom(waitingRoomId, creatorUsername, socketId) {
        if (this.waitingRooms[waitingRoomId]) return null;

        console.log("new room created: ", waitingRoomId, "by ", creatorUsername);
        this.waitingRooms[waitingRoomId] = {
            host: creatorUsername,
            users: new Set([creatorUsername]),
            started: false,
        };

        return this.waitingRooms[waitingRoomId];
    }

    isWaitingRoomExist(waitingRoomId) {
        return this.waitingRooms[waitingRoomId] !== undefined;
    }

    getWaitingRoom(waitingRoomId) {
        console.log("in get lobby");
        this.printWaitingRooms();
        return this.waitingRooms[waitingRoomId];
    }

    joinWaitingRoom(waitingRoomId, username, socketId) {
        console.log("trying to join the lobby ", waitingRoomId, "with user ", username);
        this.printWaitingRooms();
        const waitingRoom = this.waitingRooms[waitingRoomId];
        if (waitingRoom) {
            const alreadyActive = waitingRoom.users.has(username) && socketManager.isConnected(username);

            if (!alreadyActive) {
                waitingRoom.users.add(username);
            }
        }
    }

    getWaitingRoomUsers(waitingRoomId) {
        const waitingRoom = this.waitingRooms[waitingRoomId];
        return waitingRoom ? Array.from(waitingRoom.users) : [];
    }

    getAllWaitingRooms() {
        return this.waitingRooms;
    }

    leaveWaitingRoom(waitingRoomId, username) {
        const waitingRoom = this.waitingRooms[waitingRoomId];
        if (waitingRoom) {
            const existed = waitingRoom.users.has(username);

            if (existed) {
                waitingRoom.users.delete(username);

                if (waitingRoom.users.size === 0) {
                    delete this.waitingRooms[waitingRoomId];
                } else if (waitingRoom.host === username) {
                    const usersArray = Array.from(waitingRoom.users);
                    waitingRoom.host = usersArray[0];
                }

                return true;
            }
        }
        return false;
    }

    deleteWaitingRoom(waitingRoomId) {
        delete this.waitingRooms[waitingRoomId];
    }

    printWaitingRooms() {
        console.log("📦 Current Waiting Rooms:");
        if (Object.keys(this.waitingRooms).length === 0) {
            console.log("🕳️ No active rooms.");
            return;
        }

        for (const waitingRoomId in this.waitingRooms) {
            const waitingRoom = this.waitingRooms[waitingRoomId];
            console.log(`🔑 Lobby ID: ${waitingRoomId}`);
            console.log(`👤 Creator: ${waitingRoom.host}`);
            console.log(`🎮 Started: ${waitingRoom.started}`);
            console.log(`👥 Users:`);
            let i = 1;
            waitingRoom.users.forEach((username) => {
                console.log(`   ${i}. ${username}`);
                i++;
            });
            console.log("─────────────────────────────");
        }
    }

    removeUserFromItsWaitingRooms(socketId) {
        const username = socketManager.getUsernameBySocketId(socketId);
        const waitingRooms = [];
        if (!username) {
            console.log(`No username found for socket ${socketId}`);
            return;
        }

        for (const waitingRoomId in this.waitingRooms) {
            const waitingRoom = this.waitingRooms[waitingRoomId];
            if (waitingRoom.users.has(username)) {
                if (this.leaveWaitingRoom(waitingRoomId, username)) waitingRooms.push(waitingRoomId);
            }
        }
        return waitingRooms;
    }
}

// Export singleton
module.exports = new WaitingRoomManager();
