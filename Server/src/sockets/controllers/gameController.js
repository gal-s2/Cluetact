const gameManager = require("../../game/managers/GameManager");
const socketManager = require("../../game/managers/SocketManager");
const WaitingRoomManager = require("../../game/managers/WaitingRoomManager");
const messageEmitter = require("../MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");
const ROLES = require("../../game/constants/roles");
const { KEEPER_CHOOSING_WORD } = require("../../game/constants/gameStages");

const handleRaceTimeout = (roomId) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;
    const preClueGiverUsername = room.getCurrentClueGiverUsername();
    room.handleRaceTimeout();
    const clueGiverUsername = room.getCurrentClueGiverUsername();
    const dataToSeekers = {
        clues: room.currentRound.getClues(),
        revealed: room.getRevealedLetters(),
        isWordComplete: room.isWordFullyRevealed,
        keeper: room.keeperUsername,
        players: room.players,
        clueGiverUsername,
        preClueGiverUsername,
        keeperWord: null,
    };
    const dataToKeeper = { ...dataToSeekers, keeperWord: room.getKeeperWord() };
    messageEmitter.emitToSeekers(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, dataToSeekers, room.roomId);
    messageEmitter.emitToKeeper(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, dataToKeeper, room.roomId);
};

const gameController = {
    handleJoinQueue: async (socket) => {
        let room;
        const user = await socketManager.getUserBySocketId(socket.id);

        // first check if player is already in a room. if he is, insert him to this room.
        room = gameManager.getRoomBySocket(socket);
        if (room) {
            // TODO: send current room data to player. can happen in middle of the game
            return;
        }

        const added = gameManager.addUserToQueue(user);
        if (added) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ENTERED_QUEUE, null, socket);
        } else {
            // send something to the user if he couldnt enter the queue
        }

        // Send welcome messages to all players if a room was created, otherwise notify them that they are in the queue
        /*if (room) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_NEW_ROOM,
                {
                    roomId: room.roomId,
                    players: room.players,
                },
                room.roomId
            );
        } else {
        }*/
    },

    handleLeaveQueue: async (socket) => {
        // first check if player is already in a room.
        const room = gameManager.getRoomBySocket(socket);
        if (room) return;

        const username = await socketManager.getUsernameBySocketId(socket.id);
        gameManager.removeUserFromQueue(username);
        // should send something?
    },

    handleJoinRoom: async (socket) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }

        const username = socket.user.username;
        const keeperWordOrNull = username === room.keeperUsername ? room.getKeeperWord() : null;
        const guesses = room.getGuesses();
        const clueGiverUsername = room.getCurrentClueGiverUsername();

        messageEmitter.emitToSocket(
            SOCKET_EVENTS.SERVER_GAME_JOIN,
            {
                players: room.players,
                status: room.status,
                keeperWord: keeperWordOrNull,
                revealedWord: room.getRevealedLetters(),
                wordLength: room.getKeeperWord()?.length || 0,
                clues: room.currentRound.getClues(),
                isKeeper: room.keeperUsername === socket.user.username,
                isWordChosen: !!room.getKeeperWord(),
                guesses: guesses,
                clueGiverUsername: clueGiverUsername,
                keeperTime: room.keeperChoosingWordTime,
            },
            socket
        );
    },

    handleKeeperWordSubmission: async (socket, args) => {
        let { word } = args;
        const room = gameManager.getRoomBySocket(socket);

        if (!room) return;
        if (socket.user.username !== room.keeperUsername) return;
        if (room.status != KEEPER_CHOOSING_WORD) return;

        const result = await room.setKeeperWordWithValidation(word.toLowerCase());

        if (result[0]) {
            word = room.getKeeperWord();
            room.keepersWordsHistory.add(word.toLowerCase());
            const clueGiverUsername = room.seekersUsernames[room.indexOfSeekerOfCurrentTurn];
            // send all players in room a word chosen
            for (const player of room.players) {
                const data = {
                    success: true,
                    word: player.role === ROLES.KEEPER ? word : undefined,
                    revealedWord: room.getRevealedLetters(),
                    length: word.length,
                    clueGiverUsername,
                };

                messageEmitter.emitToPlayer(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN, data, player.username);
            }
            room.status = "MID-ROUND";
        } else {
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN,
                {
                    success: false,
                    message: result[1],
                },
                socket
            );
        }
    },

    handleSubmitClue: async (socket, { definition, word }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const username = socket.user.username;
        const result = await room.startNewClueRound(username, word, definition, () => {
            handleRaceTimeout(room.roomId);
        });
        const timeLeft = room.getTimeLeft();

        if (result[0]) {
            messageEmitter.emitToKeeper(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, { clues: room.currentRound.getClues(), timeLeft }, room.roomId);

            for (const player of room.players) {
                if (player.role === ROLES.SEEKER) {
                    messageEmitter.emitToPlayer(SOCKET_EVENTS.SERVER_CLUE_REVEALED, { clues: room.currentRound.getClues(), timeLeft }, player.username);
                }
            }
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, result[1], socket);
        }
    },

    handleTryCluetact: async (socket, { guess, clueId }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const guesserUsername = socket.user.username;

        const result = await room.submitGuess(guesserUsername, guess, clueId);
        const clueGiverUsername = room.getCurrentClueGiverUsername();

        if (result.correct) {
            const dataToSeekers = {
                status: room.status,
                guesser: guesserUsername,
                word: guess,
                clues: room.currentRound.getClues(),
                revealed: room.getRevealedLetters(),
                isWordComplete: result.isWordComplete,
                keeper: room.keeperUsername,
                players: room.players,
                clueGiverUsername: clueGiverUsername,
                keeperWord: result.isWordComplete ? result.keeperWord : null,
            };
            const dataToKeeper = {
                ...dataToSeekers,
                keeperWord: room.getKeeperWord(),
            };
            if (result.isGameEnded) {
                dataToSeekers.winners = room.getWinners();
            }
            messageEmitter.emitToSeekers(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, dataToSeekers, room.roomId);
            messageEmitter.emitToKeeper(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, dataToKeeper, room.roomId);
        } else {
            const guesses = room.getGuesses();
            messageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_GUESS_FAILED, guesses, room.roomId);
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, result.message, socket);
        }
    },

    handleTryBlockClue: (socket, { guess }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const userId = socket.user.username;
        const isKeeper = room.keeperUsername === userId;

        if (!isKeeper) return;

        const result = room.tryBlockClue(guess, userId);

        if (result.success) {
            const clueGiverUsername = room.getCurrentClueGiverUsername();
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_CLUE_BLOCKED,
                {
                    clue: result.blockedClue,
                    clueGiverUsername: clueGiverUsername,
                },
                room.roomId
            );
        } else {
            const guesses = room.getGuesses();
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Block failed", socket);
            messageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_GUESS_FAILED, guesses, room.roomId);
        }
    },

    handleExitRoom: (socket) => {
        if (!socket.user) return;
        const roomId = gameManager.getRoomIdByUsername(socket.user.username);
        const room = gameManager.getRoom(roomId);
        if (!room) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }
        const otherUsernames = room.players.filter((player) => player.username !== socket.user.username).map((player) => player.username);

        gameManager.removePlayerFromRoom(roomId, socket.user.username);

        messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
        if (!gameManager.getRoom(roomId)) {
            // if room is empty, send to the other players
            for (const player of otherUsernames) {
                messageEmitter.emitToPlayer(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, player);
            }
        }
    },

    disconnect: (socket, reason) => {
        const waitingRooms = WaitingRoomManager.removeUserFromItsWaitingRooms(socket.id);
        waitingRooms.forEach((waitingRoomId) => {
            messageEmitter.broadcastToWaitingRoom(
                SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
                {
                    users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                    host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host,
                },
                waitingRoomId
            );
        });

        gameManager.removeUserFromQueue(socket?.user?.username);

        socketManager.unregister(socket);

        console.log(`[Socket ${socket.id}] disconnected.`);
    },
};

module.exports = gameController;
