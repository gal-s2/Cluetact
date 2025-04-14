const GameFactory = require('./game/GameFactory');
const { socketLogger } = require('./logger.js');

module.exports = function(io) {
  const game = new GameFactory();

  io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
      socketLogger.info(`[Socket ${socket.id}] Event: ${event} | Data: ${JSON.stringify(args)}`);
    });

    console.log('Client connected:', socket.id);

    socket.on('join_game', ({ userId, username }) => {
      //console.log(` Player joined: ${username} (${userId})`);
      game.addUserToQueue(userId);
      io.emit('player_joined', { username });
    });

    socket.on('disconnect', () => {
      console.log(' Client disconnected:', socket.id);
    });
  });
};
