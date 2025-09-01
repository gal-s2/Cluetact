const messageEmitter = require("./MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

const MATCHMAKER_INTERVAL = 15;
const MAX_PLAYERS = 5;
const MIN_PLAYERS = 3;

function startMatchmaker(gameManager) {
    setInterval(() => {
        const queue = gameManager.queue;
        const readyUsers = queue.getReadyUsers();
        if (!readyUsers || readyUsers.length < MIN_PLAYERS) return;

        const playersToMatch = readyUsers.slice(0, MAX_PLAYERS);
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
    }, MATCHMAKER_INTERVAL * 1000); // Runs every 15 seconds
}

module.exports = { startMatchmaker };
