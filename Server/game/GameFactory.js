const mongoose = require('mongoose');
const Room = require('./Room');
const GameQueue = require('./GameQueue');


class GameFactory {

    static roomId = 1;

    constructor() {
        this.rooms = {};
        this.gameQueue = new GameQueue();
    }

    createRoom(status,keeperId,listOfSeekersIds) {
        const room = new Room(GameFactory.roomId,status,keeperId,listOfSeekersIds, usernamesMap);
        this.rooms[GameFactory.currentId] = room;
        console.log("room created: ",GameFactory.currentId);
        GameFactory.currentId++;
        

        return room;
    }

    addUserToQueue(userId) {
        let ans = this.gameQueue.addUser(userId);
        if (ans.roomCreationPossible === true) {
            let keeperID = ans.chosenUsers[0];
            let listOfSeekersIds = ans.chosenUsers.splice(1);
            this.createRoom("Created",keeperID,listOfSeekersIds);
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

}

module.exports = GameFactory;