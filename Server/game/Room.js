const redis = require('../config/redis')
const Player = require('./Player');
const GameFactory = require('./GameFactory')
const gameFactory = new GameFactory();

class Room {
    constructor(roomId) {
        this.roomId = roomId;
    }

    async addPlayer(userId) {
        const player = await GameFactory.createPlayer(userId);
        //to be continued...
    }

}