const GameManager = require("../../game/managers/GameManager");
const MessageEmitter = require("../MessageEmitter");

const roomSideEffects = {
    onKeeperWordTimeout: (room) => {
        if (!room) return;
        MessageEmitter.broadcastToRoom("server keeper timer timeout", { message: "Keeper didn't choose a word in time." }, room.roomId);

        //        MessageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT, { message: "Keeper didn't choose a word in time." }, room.roomId);
    },
};

module.exports = roomSideEffects;
