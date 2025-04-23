class SocketManager {
    constructor() {
        this.usernameToSocket = new Map();
        this.socketIdToUsername = new Map();
    }

    register(socket, username) {
        this.usernameToSocket.set(username, socket);
        this.socketIdToUsername.set(socket.id, username);
    }

    unregister(socket) {
        const username = this.socketIdToUsername.get(socket.id);
        if (username) {
            this.usernameToSocket.delete(username);
        }
        this.socketIdToUsername.delete(socket.id);
    }

    getSocketByUsername(username) {
        return this.usernameToSocket.get(username);
    }

    getUsernameBySocketId(socketId) {
        return this.socketIdToUsername.get(socketId);
    }

    isConnected(username) {
        return this.usernameToSocket.has(username);
    }
}

module.exports = SocketManager;
