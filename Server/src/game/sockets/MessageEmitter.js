const socketManager = require("../managers/SocketManager");
const gameManager = require("../managers/GameManager");
const waitingRoomManager = require("../managers/WaitingRoomManager");
const { ROLES } = require("../constants");

class MessageEmitter {
    /**
     * Emits an event to the keeper in the specified room.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {string} roomId - The ID of the room.
     */
    emitToKeeper(event, data, roomId) {
        const room = gameManager.getRoom(roomId);
        if (room) {
            const keeper = room.players.find((player) => player.role === ROLES.KEEPER);
            if (keeper) this.emitToPlayer(event, data, keeper.username);
        }
    }

    /**
     * Emits an event to all seekers in the specified room.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {string} roomId - The ID of the room.
     */
    emitToSeekers(event, data, roomId) {
        const room = gameManager.getRoom(roomId);
        if (room) {
            const seekers = room.players.filter((player) => player.role === ROLES.SEEKER);
            if (seekers.length > 0) {
                seekers.forEach((seeker) => {
                    this.emitToPlayer(event, data, seeker.username);
                });
            }
        }
    }

    /**
     * Emits an event to a specific player by username.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {string} username - The username of the target player.
     */
    emitToPlayer(event, data, username) {
        const socket = socketManager.getSocketByUsername(username);
        if (socket) socket.emit(event, data);
    }

    /**
     * Emits an event directly to a given socket.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {Socket} socket - The target socket instance.
     */
    emitToSocket(event, data, socket) {
        socket.emit(event, data);
    }

    /**
     * Broadcasts an event to all players in a specific room.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {string} roomId - The ID of the room.
     */
    broadcastToRoom(event, data, roomId) {
        const room = gameManager.getRoom(roomId);
        if (room) {
            room.players.forEach((player) => {
                this.emitToPlayer(event, data, player.username);
            });
        }
    }

    /**
     * Broadcasts an event to all users in a waiting room.
     * @param {string} event - The event name.
     * @param {*} data - The data to send with the event.
     * @param {string} waitingRoomId - The ID of the waiting lobby.
     */
    broadcastToWaitingRoom(event, data, waitingRoomId) {
        const users = waitingRoomManager.getWaitingRoomUsers(waitingRoomId);
        users.forEach((username) => {
            const socket = socketManager.getSocketByUsername(username);
            if (socket) socket.emit(event, data);
        });
    }
}

module.exports = new MessageEmitter();
