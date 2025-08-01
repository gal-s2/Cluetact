const messageEmitter = require("./MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

function startMatchmaker(gameManager) {
    setInterval(() => {
        const queue = gameManager.queue;
        const readyUsers = queue.getReadyUsers();
        if (!readyUsers || readyUsers.length < 3) return;

        const playersToMatch = readyUsers.slice(0, 6); // Match 3–6 players
        const keeper = playersToMatch[0];
        const seekers = playersToMatch.slice(1);

        playersToMatch.forEach((player) => queue.removeUser(player.username));
        const room = gameManager.createRoom(keeper, seekers);

        // send room creation event to all players in the room
        messageEmitter.broadcastToRoom(
            SOCKET_EVENTS.SERVER_NEW_ROOM,
            {
                roomId: room.roomId,
                players: room.players,
            },
            room.roomId
        );
    }, 15000); // Runs every 5 seconds
}

module.exports = { startMatchmaker };
