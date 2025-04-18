// Handle join queue logic.
// If a room was creted, new_room is being sent to players in room.
const handleJoinQueue = async (socket, args, { game, socketUsernameMap, usernameSocketMap }) => {
    const { username } = args;
  
    socketUsernameMap.set(socket.id, username);
    usernameSocketMap.set(username, socket);
  
    const room = await game.addUserToQueue(username);
  
    if (room) {
        // Send welcome messages to all players
        Object.values(room.players).forEach(player => {
            const playerSocket = usernameSocketMap.get(player.username);
            if (playerSocket) {
                const role = player.role;
                const message = role === 'keeper'
                    ? `You are the keeper in Room ${room.roomId}`
                    : `You are a seeker in Room ${room.roomId}`;
                    
                const welcome = `Welcome to Room ${room.roomId}!`;
        
                console.log(`→ Emitting 'welcome' to ${player.username} (${playerSocket.id})`);

                playerSocket.emit('new_room', {
                    roomId: room.roomId,
                    players: room.players
                });                
            }
        });
    
        // Ask keeper for a word
        /*const keeper = room.players[room.keeperUsername];
        const keeperSocket = usernameSocketMap.get(keeper.username);
        if (keeperSocket) {
            keeperSocket.emit('request_keeper_word', {
            message: `${keeper.username}, please enter your secret English word:`
            });
        }*/
    }
};

const handleJoinRoom = async (socket, args, { game, socketUsernameMap, usernameSocketMap}) => {
    // find the user id of this player
    // find the room id hes in
    // send room data to user

    //let username = socketUsernameMap[socket.id];
    //console.log(username);

    //const roomId = game.getRoomByUserId(userId);
    //if (roomId) {
    //    console.log('roomId', roomId)
    //}
    //console.log('join room');
};

const handleKeeperWordSubmission = async (socket, data, { socketUsernameMap, findRoomByUsername }) => {
    const { word } = data;
    const username = socketUsernameMap.get(socket.id);
    const room = findRoomByUsername(username);
    if (!room) return;
  
    const valid = await room.setKeeperWordWithValidation(word);
  
    if (valid) {
      socket.emit('log_message', {
        message: 'Your word was accepted!'
      });
      // Continue game logic if needed here
    } else {
      socket.emit('log_message', {
        message: 'Invalid word. Please enter a valid English word.'
      });
      socket.emit('request_keeper_word', {
        message: 'Please try again:'
      });
    }
};

const disconnect = (socket, data, { socketUsernameMap, usernameSocketMap }) => {
    const username = socketUsernameMap.get(socket.id);
    console.log('Client disconnected:', socket.id, '(', username, ')');

    socketUsernameMap.delete(socket.id);
    usernameSocketMap.delete(username);
};

module.exports = { 
    handleJoinQueue,
    handleJoinRoom,
    handleKeeperWordSubmission,
    disconnect
};