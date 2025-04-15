// gameSocketHandlers.js
const GameFactory = require('./game/GameFactory');
const Logger = require('./game/Logger');

const socketUsernameMap = new Map(); // socket.id → username
const usernameSocketMap = new Map(); // username → socket

module.exports = function(io) {
  const game = new GameFactory();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', async ({ username }) => {
      socketUsernameMap.set(socket.id, username);
      usernameSocketMap.set(username, socket);

      const room = await game.addUserToQueue(username);

      if (room) {
        // send welcome messages to all players in the room
        Object.values(room.players).forEach(player => {
          const playerSocket = usernameSocketMap.get(player.username);

          if (playerSocket) {
            const role = player.role;
            const message = role === 'keeper'
              ? `You are the keeper in Room ${room.roomId}`
              : `You are a seeker in Room ${room.roomId}`;

            const welcome = `Welcome to Room ${room.roomId}!`;

            playerSocket.emit('log_message', {
              message: welcome + ' ' + message
            });
          }
        });

        // ask keeper for a valid word only via their socket
        const keeper = room.players[room.keeperUsername];
        const keeperSocket = usernameSocketMap.get(keeper.username);

        if (keeperSocket) {
          keeperSocket.emit('request_keeper_word', {
            message: `${keeper.username}, please enter your secret English word:`
          });
        }
      }
    });

    socket.on('keeper_word_submission', async ({ word }) => {
      const username = socketUsernameMap.get(socket.id);
      const room = findRoomByUsername(username);
      if (!room) return;
    
      const valid = await room.setKeeperWordWithValidation(word);
    
      if (valid) {
        socket.emit('log_message', {
          message: 'Your word was accepted!'
        });
        // Here we can continue the game if needed
      } else {
        socket.emit('log_message', {
          message: ' Invalid word. Please enter a valid English word.'
        });
        socket.emit('request_keeper_word', {
          message: 'Please try again:'
        });
      }
    });
    

    socket.on('disconnect', () => {
      const username = socketUsernameMap.get(socket.id);
      console.log('Client disconnected:', socket.id, '(', username, ')');

      socketUsernameMap.delete(socket.id);
      usernameSocketMap.delete(username);
    });
  });
};

