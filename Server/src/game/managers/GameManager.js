const Room = require("../entities/Room");
const GameQueue = require("../entities/GameQueue");
const Logger = require("../Logger");

class GameManager {
    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.playerToRoomId = new Map();
        this._queue = new GameQueue();
        this.callbacks = {};
    }

    get queue() {
        return this._queue;
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }

    /**
     * Creates a new room with the given keeper and seekers.
     * @param {Player} keeper
     * @param {Player} seekers
     * @returns {Room} The created room object.
     */
    createRoom(keeper, seekers) {
        const room = new Room(GameManager.roomId, keeper, seekers, this.callbacks);

        this.rooms[GameManager.roomId] = room;
        Logger.logRoomCreated(GameManager.roomId, room.players);

        room.players.forEach((player) => {
            this.playerToRoomId.set(player.username, room.roomId);
        });

        GameManager.roomId++;
        return room;
    }

    /**
     * Adds a user to the game queue.
     * @param {string} username
     * @returns {boolean} true if the user is in the queue, false otherwise
     */
    addUserToQueue(user) {
        if (!user) return;
        return this._queue.addUser(user);
    }

    /**
     * Removes a user from the game queue.
     * @param {string} username
     * @returns {void}
     */
    removeUserFromQueue(username) {
        if (!username) return;
        this._queue.removeUser(username);
    }

    /**
     * Gets roomId and return the room object of this id
     * @param {string} roomId
     * @returns
     */
    getRoom(roomId) {
        return this.rooms[roomId];
    }

    /**
     * Gets username. returns the id of the room that the player is in
     * @param {string} username
     * @returns
     */
    getRoomIdByUsername(username) {
        return this.playerToRoomId.get(username);
    }

    /**
     * Gets a socket. return the room of the socket's user
     * @param {*} socket
     * @returns
     */
    getRoomBySocket(socket) {
        const username = socket.user.username;
        const roomId = this.getRoomIdByUsername(username);
        const room = this.getRoom(roomId);
        return room;
    }

    /**
     * Removes a player from the room
     * @param {number} roomId
     * @param {string} username
     */
    removePlayerFromRoom(roomId, username) {
        this.playerToRoomId.delete(username);
        const room = this.getRoom(roomId);

        if (room) {
            room.removePlayerByUsername(username);
            //if (room.players.length < 3) { right now we delete the room if a player exits
            for (const player of room.players) {
                this.playerToRoomId.delete(player.username);
            }
            room.destroy();
            delete this.rooms[roomId];
        }
    }
}

module.exports = new GameManager();
