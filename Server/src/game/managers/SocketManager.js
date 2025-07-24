const User = require("../../models/User");

/**
 * A class to manage socket-user mappings.
 * It stores connections and provides methods to retrieve and remove them.
 */
class SocketManager {
    /**
     * Creates an instance of the SocketManager class.
     */
    constructor() {
        // Maps username to socket and socket id to username
        this.usernameToSocket = new Map();
        this.socketIdToUsername = new Map();
        this.guestCount = 0;
    }

    addAndFetchGuestCount() {
        this.guestCount++;
        return this.guestCount;
    }

    /**
     * Registers a socket with a username.
     * @param {Socket} socket - The socket object to register.
     * @param {string} username - The username associated with the socket.
     */
    register(socket, username) {
        this.usernameToSocket.set(username, socket);
        this.socketIdToUsername.set(socket.id, username);
    }

    /**
     * Unregisters a socket by removing it from both maps.
     * @param {Socket} socket - The socket object to unregister.
     */
    unregister(socket) {
        const username = this.socketIdToUsername.get(socket.id);
        if (username) {
            this.usernameToSocket.delete(username);
        }
        this.socketIdToUsername.delete(socket.id);
    }

    /**
     * Retrieves the socket associated with a given username.
     * @param {string} username - The username to find the socket for.
     * @returns {Socket} The socket associated with the username, or undefined if not found.
     */
    getSocketByUsername(username) {
        return this.usernameToSocket.get(username);
    }

    /**
     * Retrieves the username associated with a given socket ID.
     * @param {string} socketId - The socket ID to find the username for.
     * @returns {string} The username associated with the socket ID, or undefined if not found.
     */
    getUsernameBySocketId(socketId) {
        return this.socketIdToUsername.get(socketId);
    }

    async getUserByUsername(username) {
        let user = await User.findOne({ username });

        return user;
    }

    async getUserBySocketId(socketId) {
        const username = this.socketIdToUsername.get(socketId);

        if (!username) {
            return null;
        }

        return await this.getUserByUsername(username);
    }

    /**
     * Checks if a user is currently connected by verifying if their username exists in the map.
     * @param {string} username - The username to check the connection for.
     * @returns {boolean} True if the user is connected, false otherwise.
     */
    isConnected(username) {
        return this.usernameToSocket.has(username);
    }
}

module.exports = new SocketManager();
