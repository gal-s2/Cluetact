const mongoose = require('mongoose');
const redis = require('../config/redis');
const Room = require('./Room');

class GameFactory {
    constructor() {
        this.currentId = 1;
        this.rooms = {};
    }

    createRoom(status,keeperId,listOfSeekersIds) {
        const room = new Room(this.currentId,status,keeperId,listOfSeekersIds);
        this.rooms[this.currentId] = room;
        this.currentId++;

        return room;
    }

    createPlayer(userId) {}

    getRoom(roomId) {
        return this.rooms[roomId];
    }

}

module.exports = GameFactory;