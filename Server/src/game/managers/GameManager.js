const Room = require("../entities/Room");
const GameQueue = require("../entities/GameQueue");
const Logger = require("../Logger");

class GameManager {
    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.playerToRoomId = new Map();
        this.gameQueue = new GameQueue();
    }

    createRoom(keeper, seekers) {
        const room = new Room(GameManager.roomId, keeper, seekers);

        this.rooms[GameManager.roomId] = room;
        Logger.logRoomCreated(GameManager.roomId, room.players);
        GameManager.roomId++;

        room.players.forEach((player) => {
            this.playerToRoomId.set(player.username, room.roomId);
        });

        return room;
    }

    addUserToQueue(user) {
        const result = this.gameQueue.addUser(user);
        if (result.roomCreationPossible) {
            const keeper = result.chosenUsers[0];
            const seekers = result.chosenUsers.slice(1);

            const room = this.createRoom(keeper, seekers);

            return room;
        }

        return null;
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

    removePlayerFromRoom(roomId, username) {
        this.playerToRoomId.delete(username);
        const room = this.getRoom(roomId);
        if (room) {
            room.removePlayer(username);
            if (room.players.length < 3) {
                for (const player of room.players) {
                    this.playerToRoomId.delete(player.username);
                }
                delete this.rooms[roomId];
            }
        }
    }
}

module.exports = new GameManager();
