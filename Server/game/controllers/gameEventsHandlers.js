const gameManager = require("../managers/GameManager");
const socketManager = require("../managers/SocketManager");
const waitingLobbyManager = require("../managers/WaitingLobbyManager");
const messageEmitter = require("../sockets/MessageEmitter");
const SOCKET_EVENTS = require("../../../shared/socketEvents.json");
const { ROLES } = require("../constants");

const gameEventsHandlers = {
    handleJoinQueue: async (socket, args) => {
        // const { username } = args;
        let room;
        const user = await socketManager.getUserBySocketId(socket.id);

        // first check if player is already in a room. if he is, insert him to this room.
        room = gameManager.getRoomBySocket(socket);
        if (room) {
            // TODO: send current room data to player. can happen in middle of the game
            return;
        } else {
            room = gameManager.addUserToQueue(user);
        }

        // Send welcome messages to all players if a room was created, otherwise notify them that they are in the queue
        if (room) {
            console.log("i'm about to let everyone know that a new room was created");
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_NEW_ROOM,
                {
                    roomId: room.roomId,
                    players: room.players,
                },
                room.roomId
            );
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ENTERED_QUEUE, null, socket);
        }
    },

    handleJoinRoom: async (socket, args) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, { room }, socket);
            return;
        }

        const username = socket.user.username;
        const keeperWordOrNull = username === room.keeperUsername ? room.getKeeperWord() : null;
        messageEmitter.emitToSocket(
            SOCKET_EVENTS.SERVER_GAME_JOIN,
            {
                players: room.players,
                keeperWord: keeperWordOrNull,
                revealedWord: room.getRevealedLetters(),
                wordLength: room.getKeeperWord()?.length || 0,
                clues: room.currentRound.getClues(),
                isKeeper: room.keeperUsername === socket.user.username,
                isWordChosen: !!room.getKeeperWord(),
            },
            socket
        );
    },

    handleKeeperWordSubmission: async (socket, args) => {
        let { word } = args;
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const valid = await room.setKeeperWordWithValidation(word);

        if (valid) {
            word = room.getKeeperWord();

            // send all players in room a word chosen
            for (const player of room.players) {
                const message = {
                    success: true,
                    word: player.role === ROLES.KEEPER ? word : undefined,
                    revealedWord: room.getRevealedLetters(),
                    length: word.length,
                };

                messageEmitter.emitToPlayer(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN, message, player.username);
            }
            room.status = "MID-ROUND";
        } else {
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN,
                {
                    success: false,
                },
                socket
            );
        }
    },

    handleSubmitClue: async (socket, { definition, word }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const username = socket.user.username;
        const success = await room.startNewClueRound(username, word, definition);
        if (success) {
            const addedClue = room.currentRound.clues.at(-1);
            messageEmitter.emitToKeeper(
                SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK,
                {
                    from: username,
                    definition,
                },
                room.roomId
            );

            for (const player of room.players) {
                if (player.role === ROLES.SEEKER) {
                    messageEmitter.emitToPlayer(SOCKET_EVENTS.SERVER_CLUE_REVEALED, room.currentRound.getClues(), player.username);
                }
            }
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "The clue is invalid, already used or blocked. Please try again", socket);
        }
    },

    handleTryCluetact: async (socket, { guess, clueId }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const guesserUsername = socket.user.username;
        const clueGiverUserName = room.currentRound.clues.find((clue) => clue.id === clueId).from;
        if (guesserUsername === clueGiverUserName) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "You cannot guess your own clue", socket);
            return;
        }
        const result = await room.submitGuess(guesserUsername, guess, clueId);

        if (result.correct) {
            const data = {
                guesser: guesserUsername,
                word: guess,
                clues: room.currentRound.getClues(),
                revealed: room.getRevealedLetters(),
                isWordComplete: result.isWordComplete,
                keeper: room.keeperUsername,
                players: room.players,
            };
            if (result.isGameEnded) {
                data.winners = room.getWinners();
            }
            messageEmitter.broadcastToRoom(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, data, room.roomId);
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Incorrect Guess", socket);
        }
    },

    handleTryBlockClue: (socket, { guess }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const userId = socket.user.username;
        const isKeeper = room.keeperUsername === userId;

        if (!isKeeper) return; // optional: prevent non-keepers from blocking

        const result = room.tryBlockClue(guess, userId);

        if (result.success) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.SERVER_CLUE_BLOCKED,
                {
                    word: result.blockedClue.word,
                    from: result.blockedClue.from,
                    definition: result.blockedClue.definition,
                    blockedBy: userId,
                },
                room.roomId
            );
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Block failed. Either the clue does not exist or it has already been blocked.", socket);
        }
    },

    handleExitRoom: (socket) => {
        if (!socket.user) return;
        const roomId = gameManager.getRoomIdByUsername(socket.user.username);
        const room = gameManager.getRoom(roomId);
        const otherUsernames = room.players.filter((player) => player.username !== socket.user.username).map((player) => player.username);
        console.log("other usernames are ", otherUsernames);

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
        const lobbies = waitingLobbyManager.removeUserFromItsLobbies(socket.id);
        lobbies.forEach((lobbyId) => {
            socket.leave(lobbyId);
            messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
        });
        console.log("about to delete socket from socketManager");
        socketManager.unregister(socket);

        console.log(`[Socket ${socket.id}] disconnected.`);
    },
};

module.exports = gameEventsHandlers;
