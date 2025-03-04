const redis = require('../config/redis')
const Player = require('./Player');
const GameFactory = require('./GameFactory')
const gameFactory = new GameFactory();

class Room {
    constructor(roomId,keeperId,listOfSeekersIds) {
        this.roomId = roomId;
        this.keeperId = keeperId;
        this.listOfSeekersIds = listOfSeekersIds;

    }

    async initRoomInRedis() {
        
    }

    /*
    const roomData = redis.hset(`room:${this.id}`, "name", this.name, "host", this.host, "status", this.status);
    const playersData = redis.sadd(`room:${this.id}:players`, ...this.players);
    return Promise.all([roomData, playersData]);
    */



    async addPlayer(userId) {
        const player = await GameFactory.createPlayer(userId);
        
    }

}