const Player = require('./Player');
const GameSession = require('./GameSession')

class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds, usernamesMap = {}) {
        this.roomId = roomId;
        this.status = status; // Created, inProgress, Ended
        this.keeperId = keeperId; 
        this.listOfSeekersIds = listOfSeekersIds;
        this.currentSession = new GameSession();

         // Add keeper
         const keeper = new Player(keeperId, usernamesMap[keeperId] || 'Unknown');
         keeper.setRole('keeper');
         this.players[keeperId] = keeper;
 
         // Add seekers
         listOfSeekersIds.forEach((id) => {
             const seeker = new Player(id, usernamesMap[id] || 'Unknown');
             seeker.setRole('seeker');
             this.players[id] = seeker;
         });
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