const Room = require("../models/Room");
const GameQueue = require("../models/GameQueue");
const Logger = require("../Logger");

class GameManager {
    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.playerToRoom = new Map();
        this.gameQueue = new GameQueue();
    }

    createRoom(status, keeperUsername, seekersUsernames) {
        const room = new Room(GameManager.roomId, status, keeperUsername, seekersUsernames);

        this.rooms[GameManager.roomId] = room;
        Logger.logRoomCreated(GameManager.roomId, room.players);
        GameManager.roomId++;

        room.players.forEach((player) => {
            console.log("player", player.username);
            this.playerToRoom.set(player.username, room.roomId);
        });

        return room;
    }

    async addUserToQueue(username) {
        const result = this.gameQueue.addUser(username);

        if (result.roomCreationPossible) {
            const keeperUsername = result.chosenUsers[0];
            const seekersUsernames = result.chosenUsers.slice(1);

            const room = await this.createRoom("Created", keeperUsername, seekersUsernames);

            //await room.runGame(require('prompt-sync')());
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
     * Gets username. returns the player object of the user
     * @param {string} username
     * @returns
     */
    getRoomByUsername(username) {
        return this.playerToRoom.get(username);
    }

    /**
     * Gets a socket. return the room of the socket's user
     * @param {*} socket
     * @returns
     */
    getRoomBySocket(socket) {
        const username = socket.user.username;
        const roomId = this.getRoomByUsername(username);
        const room = this.getRoom(roomId);
        return room;
    }
}

module.exports = new GameManager();
