const redis = require('../config/redis')
const Player = require('./Player');

class Room {
    constructor(roomId,status,keeperId,listOfSeekersIds) {
        this.roomId = roomId;
        this.status = status;
        this.keeperId = keeperId;
        this.listOfSeekersIds = listOfSeekersIds;
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