const gameManager = require("../managers/GameManager");
const socketManager = require("../managers/SocketManager");
const waitingLobbyManager = require("../managers/WaitingLobbyManager");

/**
 * Handles the logic for joining the queue.
 * If a room is created, a "new_room" event is sent to players in the room.
 * @param {Socket} socket - The socket of the user joining the queue.
 * @param {Object} args - The arguments passed to the event.
 * @param {Object} params - Additional parameters, including gameManager and socketManager.
 * @param {GameManager} params.gameManager - The game manager instance to interact with game data.
 * @param {SocketManager} params.socketManager - The socket manager instance to interact with socket connections.
 */
const handleJoinQueue = async (socket, args) => {
    const { username } = args;

    const room = await gameManager.addUserToQueue(username);

    // Send welcome messages to all players if a room was created, otherwise notify that they are in queue
    if (room) {
        Object.values(room.players).forEach((player) => {
            const playerSocket = socketManager.getSocketByUsername(player.username);
            if (playerSocket) {
                playerSocket.emit("new_room", {
                    roomId: room.roomId,
                    players: room.players,
                });
            }
        });
    } else {
        socket.emit("entered_queue");
    }
};

/**
 * Handles the logic for joining a room.
 * Sends a "game_start" event with the room data to the joining user.
 * Sends a "request_keeper_word" event to each player to request their word submission.
 * @param {Socket} socket - The socket of the user joining the room.
 * @param {Object} args - The arguments passed to the event.
 * @param {Object} params - Additional parameters, including gameManager and socketManager.
 * @param {GameManager} params.gameManager - The game manager instance to interact with game data.
 * @param {SocketManager} params.socketManager - The socket manager instance to interact with socket connections.
 */
const handleJoinRoom = async (socket, args) => {
    const room = gameManager.getRoomBySocket(socket);
    if (!room) return;

    socket.emit("game_start", { room });

    for (const player of Object.values(room.players)) {
        const playerSocket = socketManager.getSocketByUsername(player.username);
        if (player.role === "keeper") {
            playerSocket.emit("request_keeper_word", {
                message: `${player.username}, please enter your secret English word:`,
                isKeeper: true,
            });
        } else {
            playerSocket.emit("request_keeper_word", {
                message: `keeper is choosing a word`,
                isKeeper: false,
            });
        }
    }
};

/**
 * Handles the logic for submitting the keeper's word.
 * Validates the word and sends a "keeper_word_chosen" event to all players in the room.
 * @param {Socket} socket - The socket of the user submitting the word.
 * @param {Object} args - The arguments passed to the event.
 * @param {Object} params - Additional parameters, including gameManager and socketManager.
 * @param {GameManager} params.gameManager - The game manager instance to interact with game data.
 * @param {SocketManager} params.socketManager - The socket manager instance to interact with socket connections.
 */
const handleKeeperWordSubmission = async (socket, args) => {
    let { word } = args;
    const room = gameManager.getRoomBySocket(socket);
    if (!room) return;

    const valid = await room.setKeeperWordWithValidation(word);

    if (valid) {
        word = room.getKeeperWord();

        // send all players in room a word chosen
        for (const username in room.players) {
            let playerSocket = socketManager.getSocketByUsername(username);
            let player = room.getPlayerByUsername(username);

            let message = {
                success: true,
                message: "Your word was accepted!",
                word: player.role === "keeper" ? word : undefined,
                revealedWord: room.getRevealedLetters(),
                length: word.length,
            };

            playerSocket.emit("keeper_word_chosen", message);
        }
    } else {
        socket.emit("keeper_word_chosen", {
            success: false,
            message: "Invalid word. Please enter a valid English word.",
        });
    }
};

const handleSubmitClue = (socket, { definition, word }) => {
    const room = gameManager.getRoomBySocket(socket);
    if (!room) return;

    const username = socket.user.username;
    const success = room.startNewClueRound(username, word, definition);

    if (success) {
        const addedClue = room.currentRound.clues.at(-1);
        for (const player of Object.values(room.players)) {
            const playerSocket = socketManager.getSocketByUsername(player.username);

            if (player.role === "seeker" && player.username !== username) {
                playerSocket.emit("clue_revealed", {
                    id: addedClue.id,
                    from: username,
                    definition,
                });
            }

            if (player.role === "keeper") {
                playerSocket.emit("clue_submitted", {
                    from: username,
                    definition,
                });
            }
        }
    } else {
        socket.emit("clue_rejected", {
            message: "Invalid clue or word already used.",
        });
    }
};

const handleSubmitGuess = async (socket, { guess, clueId }) => {
    const room = gameManager.getRoomBySocket(socket);
    if (!room) return;

    const userId = socket.user.username;
    const isKeeper = room.keeperUsername === userId;

    // 🔸 Keeper trying to block a clue
    if (isKeeper) {
        const result = room.currentRound.tryBlockClue(guess, userId);

        if (result.success) {
            for (const player of Object.values(room.players)) {
                const playerSocket = socketManager.getSocketByUsername(player.username);
                if (playerSocket) {
                    playerSocket.emit("clue_blocked", {
                        word: result.blockedClue.word,
                        from: result.blockedClue.from,
                        definition: result.blockedClue.definition,
                        blockedBy: userId,
                    });
                }
            }
        } else {
            socket.emit("guess_failed", {
                message: "No matching clue to block.",
            });
        }

        return;
    }

    // 🔹 Regular seeker guess flow
    const result = await room.submitGuess(userId, guess, clueId);

    if (result.correct) {
        for (const player of Object.values(room.players)) {
            const playerSocket = socketManager.getSocketByUsername(player.username);
            if (playerSocket) {
                playerSocket.emit("cluetact_success", {
                    guesser: userId,
                    word: guess,
                    revealed: room.getRevealedLetters(),
                });
            }
        }
    } else {
        socket.emit("guess_failed", { message: "Incorrect guess" });
    }
};

/**
 * Handles the logic for socket disconnections.
 * Unregisters the socket from the socket manager when a user disconnects.
 * @param {Socket} socket - The socket of the user disconnecting.
 * @param {Object} args - The arguments passed to the event.
 * @param {Object} params - Additional parameters, including gameManager and socketManager.
 * @param {GameManager} params.gameManager - The game manager instance to interact with game data.
 * @param {SocketManager} params.socketManager - The socket manager instance to interact with socket connections.
 */
const disconnect = (socket, args) => {
    console.log(`${socket?.user?.username} disconnected: ${args}`);

    const lobbies = waitingLobbyManager.removeUserFromItsLobbies(socket.id);
    lobbies.forEach((lobbyId) => {
        socket.leave(lobbyId);
        socket.to(lobbyId).emit("lobby_update", waitingLobbyManager.getLobbyUsers(lobbyId));
    });

    socketManager.unregister(socket);

    console.log(`[Socket ${socket.id}] disconnected.`);
};

module.exports = {
    handleJoinQueue,
    handleJoinRoom,
    handleKeeperWordSubmission,
    handleSubmitClue,
    handleSubmitGuess,
    disconnect,
};
