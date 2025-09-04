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
                keeperTime: room.getTimeLeftUntilTimeout(),
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
                    timeLeft: room.getTimeLeftUntilTimeout() || 0,
                    clueGiverUsername: room.getCurrentClueGiverUsername(),
                },
                room.roomId
            );
        }
    },
    onRaceTimeout: (room, prevClueGiverUsername) => {
        console.log("roomSideEffects onRaceTimeout", room.roomId, room.status);
        if (!room) return;

        if (room.status === GAME_STAGES.CLUE_SUBMISSION) {
            const clueGiverUsername = room.getCurrentClueGiverUsername();
            const dataToSeekers = {
                status: room.status,
                clues: room.currentRound.getClues(),
                revealed: room.getRevealedLetters(),
                isWordComplete: room.isWordFullyRevealed,
                keeper: room.keeperUsername,
                players: room.players,
                clueGiverUsername,
                prevClueGiverUsername,
                keeperWord: null,
                timeLeft: room.getTimeLeftUntilTimeout(),
            };
            const dataToKeeper = { ...dataToSeekers, keeperWord: room.getKeeperWord() };
            messageEmitter.emitToSeekers(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, dataToSeekers, room.roomId);
            messageEmitter.emitToKeeper(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, dataToKeeper, room.roomId);
        }
    },
};

module.exports = roomSideEffects;
