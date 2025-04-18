const Room = require('./Room');
const GameQueue = require('./GameQueue');
const Logger = require('./Logger');

class GameManager {
    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.userToRoom = new Map();
        this.gameQueue = new GameQueue();
    }

    createRoom(status, keeperUsername, seekersUsernames) {
        const room = new Room(
            GameManager.roomId,
            status,
            keeperUsername,
            seekersUsernames
        );

        this.rooms[GameManager.roomId] = room;
        Logger.logRoomCreated(GameManager.roomId, room.players);
        GameManager.roomId++;

        Object.keys(room.players).forEach(player => {
            console.log(player);
            this.userToRoom.set(player.id, room.roomId);
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
    
    getRoom(roomId) {
        return this.rooms[roomId];
    }

    getRoomByUserId(userId) {
        return this.userToRoom.get(userId);
    }
}

module.exports = GameManager;