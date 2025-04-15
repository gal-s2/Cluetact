// gameSocketHandlers.js
const GameFactory = require('./game/GameFactory');
const { socketLogger } = require("./logger");

const { handleJoinGame, disconnect } = require('./gameSocketController');

const socketUsernameMap = new Map(); // socket.id → username
const usernameSocketMap = new Map(); // username → socket

module.exports = function(io) {
  const game = new GameFactory();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Log every incoming message
    socket.onAny((event, ...args) => {
      socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
    });

    socket.on('join_game', (args) => handleJoinGame(socket, args, { game, socketUsernameMap, usernameSocketMap }));
    socket.on('keeper_word_submission', (args) => handleKeeperWordSubmission(socket, args, { socketUsernameMap, findRoomByUsername }));
    socket.on('disconnect', (args) => disconnect(socket, args, { socketUsernameMap, usernameSocketMap }));
  });
};

