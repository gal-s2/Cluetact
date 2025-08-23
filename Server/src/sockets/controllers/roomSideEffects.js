const GAME_STAGES = require("../../game/constants/gameStages");
const messageEmitter = require("../MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

const roomSideEffects = {
    onKeeperWordTimeout: (room) => {
        console.log("roomSideEffects onKeeperWordTimeout", room.roomId, room.status);

        if (!room) return;

        if (room.status === GAME_STAGES.KEEPER_CHOOSING_WORD) {
            const data = {
                players: room.players,
                status: room.status,
                keeperTime: room.keeperChoosingWordTime,
            };

            messageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT, data, room.roomId);
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
    },
    onClueSubmissionTimeout: (room) => {
        console.log("roomSideEffects onClueSubmissionTimeout", room.roomId, room.status);
        if (!room) return;

        if (room.status === GAME_STAGES.CLUE_SUBMISSION) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_CLUE_SUBMISSION_TIMEOUT,
                {
                    players: room.players,
                    status: room.status,
                    timeLeft: room.clueSubmissionTimer?.getTimeLeft() || 0,
                    clueGiverUsername: room.getCurrentClueGiverUsername(),
                },
                room.roomId
            );
        }
    },
};

module.exports = roomSideEffects;
