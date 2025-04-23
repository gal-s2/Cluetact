// Handle join queue logic.
// If a room was creted, new_room is being sent to players in room.
const handleJoinQueue = async (
    socket,
    args,
    { game, socketUsernameMap, usernameSocketMap }
) => {
    const { username } = args;

    socketUsernameMap.set(socket.id, username);
    usernameSocketMap.set(username, socket);

    const room = await game.addUserToQueue(username);

    if (room) {
        // Send welcome messages to all players
        Object.values(room.players).forEach((player) => {
            const playerSocket = usernameSocketMap.get(player.username);
            if (playerSocket) {
                const role = player.role;
                const message =
                    role === "keeper"
                        ? `You are the keeper in Room ${room.roomId}`
                        : `You are a seeker in Room ${room.roomId}`;

                playerSocket.emit("new_room", {
                    roomId: room.roomId,
                    players: room.players,
                });
            }
        });
    }
};

const handleJoinRoom = async (
    socket,
    args,
    { game, socketUsernameMap, usernameSocketMap }
) => {
    const room = game.getRoomBySocket(socket);

    socket.emit("game_start", { room });

    for (const player of Object.values(room.players)) {
        if (player.role === "keeper") {
            usernameSocketMap.get(player.username).emit("request_keeper_word", {
                message: `${player.username}, please enter your secret English word:`,
                isKeeper: true,
            });
        } else {
            usernameSocketMap.get(player.username).emit("request_keeper_word", {
                message: `keeper is choosing a word`,
                isKeeper: false,
            });
        }
    }
};

const handleKeeperWordSubmission = async (
    socket,
    data,
    { game, socketUsernameMap, usernameSocketMap }
) => {
    const { word } = data;
    const room = game.getRoomBySocket(socket);
    if (!room) return;

    const valid = await room.setKeeperWordWithValidation(word);

    if (valid) {
        // send all players in room a word chosen
        for (const username in room.players) {
            let playerSocket = usernameSocketMap.get(username);
            let player = room.getPlayerByUsername(username);

            let message = {
                success: true,
                message: "Your word was accepted!",
                word: player.role === "keeper" ? word : undefined,
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

const disconnect = (socket, data, { socketUsernameMap, usernameSocketMap }) => {
    const username = socketUsernameMap.get(socket.id);
    console.log("Client disconnected:", socket.id, "(", username, ")");

    socketUsernameMap.delete(socket.id);
    usernameSocketMap.delete(username);
};

module.exports = {
    handleJoinQueue,
    handleJoinRoom,
    handleKeeperWordSubmission,
    disconnect,
};
