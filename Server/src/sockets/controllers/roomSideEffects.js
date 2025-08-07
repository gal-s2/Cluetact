const GAME_STAGES = require("../../game/constants/gameStages");
const messageEmitter = require("../MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

const roomSideEffects = {
    onKeeperWordTimeout: (room) => {
        if (!room) return;

        if (room.status === GAME_STAGES.KEEPER_CHOOSING_WORD) {
            const data = {
                players: room.players,
                status: room.status,
                keeperTime: room.keeperChoosingWordTime,
            };

            messageEmitter.emitToKeeper(
                SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT,
                {
                    ...data,
                    isKeeper: true,
                },
                room.roomId
            );

            messageEmitter.emitToSeekers(
                SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT,
                {
                    ...data,
                    isKeeper: false,
                },
                room.roomId
            );
        } else if (room.status === GAME_STAGES.END) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_GAME_ENDED,
                {
                    players: room.players,
                    winners: room.winners,
                    status: room.status,
                    reason: "keeper word timeout",
                },
                room.roomId
            );
        }

        // MessageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT, { message: "Keeper didn't choose a word in time." }, room.roomId);
    },
};

module.exports = roomSideEffects;
