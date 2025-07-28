const WaitingRoomManager = require("../../game/managers/WaitingRoomManager");
const GameManager = require("../../game/managers/GameManager");
const messageEmitter = require("../MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");
const socketManager = require("../../game/managers/SocketManager");

const waitingRoomHandlers = {
    handleDisconnect: (socket) => {
        // Handle socket disconnection
        const affectedRoomIds = WaitingRoomManager.removeUserFromItsWaitingRooms(socket.id);

        // Broadcast updates to affected rooms
        if (affectedRoomIds && affectedRoomIds.length > 0) {
            affectedRoomIds.forEach((roomId) => {
                const waitingRoom = WaitingRoomManager.getWaitingRoom(roomId);
                if (waitingRoom) {
                    messageEmitter.broadcastToWaitingRoom(
                        SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
                        {
                            users: WaitingRoomManager.getWaitingRoomUsers(roomId),
                            host: waitingRoom.host,
                        },
                        roomId
                    );
                }
            });
        }
    },

    handleCreateWaitingRoom: (socket, { waitingRoomId, username }) => {
        const waitingRoom = WaitingRoomManager.createWaitingRoom(waitingRoomId, username, socket.id);
        if (!waitingRoom) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Waiting room already exists.", socket);
            return;
        }

        // Immediately broadcast the update since creator is automatically added
        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            {
                users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host,
            },
            waitingRoomId
        );
    },

    handleJoinWaitingRoom: (socket, { waitingRoomId, username }) => {
        const isWaitingRoomExist = WaitingRoomManager.isWaitingRoomExist(waitingRoomId);
        if (!isWaitingRoomExist) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Waiting room does not exist.", socket);
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }

        // Check if user is already in the room (e.g., if they're the creator)
        const waitingRoom = WaitingRoomManager.getWaitingRoom(waitingRoomId);
        if (waitingRoom && waitingRoom.users.has(username)) {
            // User is already in room, just send current state
            messageEmitter.emitToSocket(
                SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
                {
                    users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                    host: waitingRoom.host,
                },
                socket
            );
            return;
        }

        // Join the room
        WaitingRoomManager.joinWaitingRoom(waitingRoomId, username, socket.id);

        // Broadcast update to all users in the room
        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            {
                users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                host: WaitingRoomManager.getWaitingRoom(waitingRoomId)?.host,
            },
            waitingRoomId
        );
    },

    handleGetWaitingRoomUsers: (socket, { waitingRoomId }) => {
        const waitingRoom = WaitingRoomManager.getWaitingRoom(waitingRoomId);
        if (!waitingRoom) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Waiting room does not exist.", socket);
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_REDIRECT_TO_LOBBY, null, socket);
            return;
        }

        messageEmitter.broadcastToWaitingRoom(
            SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
            {
                users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                host: waitingRoom.host,
            },
            waitingRoomId
        );
    },

    handleLeaveWaitingRoom: (socket, { waitingRoomId, username }) => {
        const leftSuccessfully = WaitingRoomManager.leaveWaitingRoom(waitingRoomId, username);

        if (leftSuccessfully) {
            const waitingRoom = WaitingRoomManager.getWaitingRoom(waitingRoomId);
            if (waitingRoom) {
                // Room still exists, broadcast update
                messageEmitter.broadcastToWaitingRoom(
                    SOCKET_EVENTS.SERVER_WAITING_ROOM_UPDATE,
                    {
                        users: WaitingRoomManager.getWaitingRoomUsers(waitingRoomId),
                        host: waitingRoom.host,
                    },
                    waitingRoomId
                );
            }
            // If room doesn't exist anymore (was deleted), no need to broadcast
        }
    },

    handleStartGameFromWaitingRoom: async (socket, { waitingRoomId }) => {
        const waitingRoom = WaitingRoomManager.getWaitingRoom(waitingRoomId);
        if (!waitingRoom || waitingRoom.users.size < 3) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Not enough users to start the game.", socket);
            return;
        }

        // Verify that the socket making the request is the host
        const requesterUser = await socketManager.getUserBySocketId(socket.id);
        const requesterUsername = requesterUser ? requesterUser.username : socketManager.getUsernameBySocketId(socket.id);
        console.log("requesterUsername: ", requesterUsername, "host: ", waitingRoom.host);
        if (!requesterUsername || requesterUsername !== waitingRoom.host) {
            messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, "Only the host can start the game.", socket);
            return;
        }

        const keeperUsername = waitingRoom.host;
        const seekersUsernames = Array.from(waitingRoom.users).filter((u) => u !== keeperUsername);
        const keeper = await socketManager.getUserByUsername(keeperUsername);
        const seekers = await Promise.all(seekersUsernames.map((username) => socketManager.getUserByUsername(username)));

        const room = GameManager.createRoom(keeper, seekers);
        messageEmitter.broadcastToWaitingRoom(SOCKET_EVENTS.SERVER_REDIRECT_TO_ROOM, { roomId: room.roomId }, waitingRoomId);

        // Clean up the waiting room
        WaitingRoomManager.deleteWaitingRoom(waitingRoomId);
    },
};

module.exports = waitingRoomHandlers;
