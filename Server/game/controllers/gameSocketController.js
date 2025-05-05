const gameManager = require("../managers/GameManager");
const socketManager = require("../managers/SocketManager");
const waitingLobbyManager = require("../managers/WaitingLobbyManager");
const messageEmitter = require("../sockets/MessageEmitter");
const SOCKET_EVENTS = require("../../../shared/socketEvents.json");

const gameSocketController = {
    handleJoinQueue: async (socket, args) => {
        const { username } = args;

        const room = await gameManager.addUserToQueue(username);

        // Send welcome messages to all players if a room was created, otherwise notify that they are in queue
        if (room) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.NEW_ROOM,
                {
                    roomId: room.roomId,
                    players: room.players,
                },
                room.roomId
            );
        } else {
            messageEmitter.emitToSocket(SOCKET_EVENTS.ENTERED_QUEUE, null, socket);
        }
    },

    handleJoinRoom: async (socket, args) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        messageEmitter.emitToSocket(SOCKET_EVENTS.GAME_START, { room }, socket);

        messageEmitter.emitToKeeper(
            SOCKET_EVENTS.REQUEST_KEEPER_WORD,
            {
                message: `Please enter your secret English word:`,
                isKeeper: true,
            },
            room.roomId
        );

        messageEmitter.emitToSeekers(
            SOCKET_EVENTS.REQUEST_KEEPER_WORD,
            {
                message: `keeper is choosing a word`,
                isKeeper: false,
            },
            room.roomId
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
                    message: "Your word was accepted!",
                    word: player.role === "keeper" ? word : undefined,
                    revealedWord: room.getRevealedLetters(),
                    length: word.length,
                };

                messageEmitter.emitToPlayer(SOCKET_EVENTS.KEEPER_WORD_CHOSEN, message, player.username);
            }
        } else {
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.KEEPER_WORD_CHOSEN,
                {
                    success: false,
                    message: "Invalid word. Please enter a valid English word.",
                },
                socket
            );
        }
    },

    handleSubmitClue: (socket, { definition, word }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const username = socket.user.username;
        const success = room.startNewClueRound(username, word, definition);

        if (success) {
            const addedClue = room.currentRound.clues.at(-1);
            messageEmitter.emitToKeeper(
                SOCKET_EVENTS.CLUE_SUBMITTED,
                {
                    from: username,
                    definition,
                },
                room.roomId
            );

            for (const player of room.players) {
                if (player.role === "seeker" && player.username !== username) {
                    messageEmitter.emitToPlayer(
                        SOCKET_EVENTS.CLUE_REVEALED,
                        {
                            id: addedClue.id,
                            from: username,
                            definition,
                        },
                        player.username
                    );
                }
            }
        } else {
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.CLUE_REJECTED,
                {
                    message: "Invalid clue or word already used.",
                },
                socket
            );
        }
    },

    handleSubmitGuess: async (socket, { guess, clueId }) => {
        const room = gameManager.getRoomBySocket(socket);
        if (!room) return;

        const userId = socket.user.username;
        const isKeeper = room.keeperUsername === userId;

        // 🔸 Keeper trying to block a clue
        if (isKeeper) {
            const result = room.currentRound.tryBlockClue(guess, userId);

            if (result.success) {
                messageEmitter.broadcastToRoom(
                    SOCKET_EVENTS.CLUE_BLOCKED,
                    {
                        word: result.blockedClue.word,
                        from: result.blockedClue.from,
                        definition: result.blockedClue.definition,
                        blockedBy: userId,
                    },
                    room.roomId
                );
            } else {
                messageEmitter.emitToSocket(
                    SOCKET_EVENTS.GUESS_FAILED,
                    {
                        message: "No matching clue to block.",
                    },
                    socket
                );
            }

            return;
        }

        // 🔹 Regular seeker guess flow
        const result = await room.submitGuess(userId, guess, clueId);

        if (result.correct) {
            messageEmitter.broadcastToRoom(
                SOCKET_EVENTS.CLUETACT_SUCCESS,
                {
                    guesser: userId,
                    word: guess,
                    revealed: room.getRevealedLetters(),
                },
                room.roomId
            );
        } else {
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.GUESS_FAILED,
                {
                    message: "Incorrect guess",
                },
                socket
            );
        }
    },

    disconnect: (socket, args) => {
        console.log(`${socket?.user?.username} disconnected: ${args}`);

        const lobbies = waitingLobbyManager.removeUserFromItsLobbies(socket.id);
        lobbies.forEach((lobbyId) => {
            socket.leave(lobbyId);
            messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.LOBBY_UPDATE, waitingLobbyManager.getLobbyUsers(lobbyId), lobbyId);
        });

        socketManager.unregister(socket);

        console.log(`[Socket ${socket.id}] disconnected.`);
    },
};

module.exports = gameSocketController;
