const Room = require('./Room');
const GameQueue = require('./GameQueue');
const Logger = require('./Logger');

class GameFactory {
    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.gameQueue = new GameQueue();
    }

    createRoom(status, keeperUsername, seekersUsernames) {
        const room = new Room(
            GameFactory.roomId,
            status,
            keeperUsername,
            seekersUsernames
        );

        this.rooms[GameFactory.roomId] = room;
        Logger.logRoomCreated(GameFactory.roomId, room.players);
        GameFactory.roomId++;

        return room;
    }

    async addUserToQueue(username) {
        const result = this.gameQueue.addUser(username);
    
        if (result.roomCreationPossible) {
            const keeperUsername = result.chosenUsers[0];
            const seekersUsernames = result.chosenUsers.slice(1);
    
            const room = await this.createRoom("Created", keeperUsername, seekersUsernames);
    
            await room.runGame(require('prompt-sync')()); 
            return room;
        }
    
        return null; 
    }
    

    getRoom(roomId) {
        return this.rooms[roomId];
    }
}

module.exports = GameFactory;
