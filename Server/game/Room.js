const redis = require('../config/redis')
const Player = require('./Player');
// const GameFactory = require('./GameFactory')
// const gameFactory = new GameFactory();

class Room {
    constructor(roomId,status,keeperId,listOfSeekersIds) {
        this.roomId = roomId;
        this.status = status;
        this.keeperId = keeperId;
        this.listOfSeekersIds = listOfSeekersIds;
        this.initRoomInRedis();
    }

    async initRoomInRedis() {
        try {
           redis.hset(`room:${this.roomId}`,"status",this.status, "keeperId", this.keeperId);
           redis.sadd(`room:${this.roomId}:listOfSeekersIds`, ...this.listOfSeekersIds);
        }
        catch (err) {
            console.log("Error: ", err);
        }
    }

    async updateStatus(status) {
        try {
            this.status = status;
            redis.hset(`room:${this.roomId}`,"status",status);
        }
        catch (err) {
            console.log("Error: ", err);
        }
    }



    async addPlayer(userId) {
        const player = await GameFactory.createPlayer(userId);
        
    }

}

module.exports = Room;