const mongoose = require('mongoose');
const Room = require('./Room');
const GameQueue = require('./GameQueue');
const Logger = require('./Logger');


class GameFactory {

    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.gameQueue = new GameQueue();
    }

    createRoom(status,keeperId,listOfSeekersIds,usernamesMap) {
        const room = new Room(GameFactory.roomId,status,keeperId,listOfSeekersIds, usernamesMap);
        this.rooms[GameFactory.currentId] = room;
        Logger.logRoomCreated(this.roomId, this.rooms[this.currentId]);
        GameFactory.currentId++;
        

        return room;
    }

    addUserToQueue(userId) {
        let ans = this.gameQueue.addUser(userId);
        if (ans.roomCreationPossible === true) {
            let keeperID = ans.chosenUsers[0];
            let listOfSeekersIds = ans.chosenUsers.splice(1);
            this.createRoom("Created",keeperID,listOfSeekersIds,usernamesMap);
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

}

module.exports = GameFactory;