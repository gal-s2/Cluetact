const socketManager = require("../managers/SocketManager");
const gameManager = require("../managers/GameManager");

const emitters = {
    emitToKeeper: (event, data, roomId) => {
        const room = gameManager.getRoom(roomId);
        if (room) {
            const keeper = this.players.find((player) => player.role === "keeper");
            if (keeper) this.emitToPlayer(event, data, keeper.username);
        }
    },

    emitToSeekers: (event, data, roomId) => {
        const room = gameManager.getRoom(roomId);
        if (room) {
            const seekers = this.players.filter((player) => player.role === "seeker");
            if (seekers.length > 0) {
                seekers.forEach((seeker) => {
                    this.emitToPlayer(event, data, seeker.username);
                });
            }
        }
    },

    emitToPlayer: (event, data, username) => {
        const socket = socketManager.getSocketByUsername(username);
        if (socket) socket.emit(event, data);
    },

    broadcastToRoom: (event, data, roomId) => {
        const room = gameManager.getRoom(roomId);
        if (room) {
            room.players.forEach((player) => {
                this.emitToPlayer(event, data, player.username);
            });
        }
    },
};

module.exports = emitters;
