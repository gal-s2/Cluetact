const Player = require('./Player');
const GameSession = require('./GameSession')

class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds) {
        this.roomId = roomId;
        this.status = status;
        this.keeperId = keeperId; 
        this.listOfSeekersIds = listOfSeekersIds;

        this.currentSession = new GameSession();
    }

    updateStatus(status) {
        this.status = status;
    }

    addPlayer(userId) {
        const player = GameFactory.createPlayer(userId);
        this.listOfSeekersIds[userId] = player;
    }

    removePlayer(userId) {
        delete this.listOfSeekersIds[userId];
    }

}

module.exports = Room;