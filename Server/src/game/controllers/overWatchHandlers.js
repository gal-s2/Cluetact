const gameManager = require("../managers/GameManager");
const socketManager = require("../managers/SocketManager");
const waitingRoomManager = require("../managers/WaitingRoomManager");
const messageEmitter = require("../sockets/MessageEmitter");
const SOCKET_EVENTS = require("@shared/socketEvents.json");

const overWatchHandlers = {
    handleGetOnlineRooms: async (socket) => {
        messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_POST_ONLINE_ROOMS, gameManager.rooms, socket);
    },

    handleGetOnlineWaitingRooms: async (socket) => {
        const serializedWaitingRooms = {};

        for (const roomId in waitingRoomManager.waitingRooms) {
            const room = waitingRoomManager.waitingRooms[roomId];

            serializedWaitingRooms[roomId] = {
                ...room,
                users: Array.from(room.users), // convert Set to array
            };
        }

        messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_POST_ONLINE_WAITING_ROOMS, serializedWaitingRooms, socket);
    },

    handleGetAllUsers: async (socket) => {
        const usersObj = {};
        for (const [username, socketInstance] of socketManager.usernameToSocket.entries()) {
            usersObj[username] = socketInstance.id;
        }

        messageEmitter.emitToSocket(SOCKET_EVENTS.SERVER_POST_ALL_USERS, usersObj, socket);
    },
};

module.exports = overWatchHandlers;
