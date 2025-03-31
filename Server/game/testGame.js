const Room = require('./Room');

const usernamesMap = {
    u1: 'Alice',    // First keeper
    u2: 'Bob',
    u3: 'Charlie'
};
const keeperId = 'u1';
const seekers = ['u2', 'u3'];

const room = new Room(1, 'Created', keeperId, seekers, usernamesMap);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log(`\n🎮 Game started. First keeper: ${usernamesMap[keeperId]}`);

    // ROUND 1 - Alice is keeper, word = "dog"
    room.currentSession.setKeeperWord('dog');
    console.log(`\n🔑 ${usernamesMap[keeperId]} sets secret word: "dog"`);
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    // Clue 1: Bob defines "duck"
    console.log(`\n💬 ${usernamesMap['u2']} defines: "A bird that quacks" (word: "duck")`);
    room.startNewClueRound('u2', 'duck');
    await delay(2000);
    console.log(`⚡ ${usernamesMap['u3']} guesses: "duck"`);
    room.submitGuess('u3', 'duck');

    console.log(`🔤 New revealed letters: ${room.currentSession.revealedLetters}`);

    // Clue 2: Charlie defines "door"
    console.log(`\n💬 ${usernamesMap['u3']} defines: "You open it to enter a room" (word: "door")`);
    room.startNewClueRound('u3', 'door');
    await delay(1500);
    console.log(`⚡ ${usernamesMap['u2']} guesses: "door"`);
    room.submitGuess('u2', 'door');

    console.log(`🔤 New revealed letters: ${room.currentSession.revealedLetters}`);

    // Bob attempts to guess the full keeper word "dog"
    console.log(`\n🎯 ${usernamesMap['u2']} attempts to guess the keeper word: "dog"`);
    room.submitGuess('u2', 'dog');

    // Should trigger rotation
    const nextKeeperId = room.getNextKeeper();
    room.keeperId = nextKeeperId;
    room.players[nextKeeperId].setRole('keeper');
    Object.keys(room.players).forEach(id => {
        if (id !== nextKeeperId) room.players[id].setRole('seeker');
    });
    room.pastKeepers.add(nextKeeperId);
    room.currentSession = new (require('./GameSession'))();

    // ROUND 2 - New keeper sets word
    room.currentSession.setKeeperWord('sun');
    console.log(`\n🔁 New keeper: ${usernamesMap[nextKeeperId]}`);
    console.log(`🔑 ${usernamesMap[nextKeeperId]} sets word: "sun"`);
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    // Alice defines "snake"
    console.log(`\n💬 ${usernamesMap['u1']} defines: "Long reptile that hisses" (word: "snake")`);
    room.startNewClueRound('u1', 'snake');
    await delay(1800);
    console.log(`⚡ ${usernamesMap['u3']} guesses: "snake"`);
    room.submitGuess('u3', 'snake');

    console.log(`🔤 New revealed letters: ${room.currentSession.revealedLetters}`);

    // Charlie guesses full keeper word "sun"
    console.log(`\n🎯 ${usernamesMap['u3']} guesses keeper word: "sun"`);
    room.submitGuess('u3', 'sun');

    // Final keeper rotation
    const finalKeeperId = room.getNextKeeper();
    room.keeperId = finalKeeperId;
    room.players[finalKeeperId].setRole('keeper');
    Object.keys(room.players).forEach(id => {
        if (id !== finalKeeperId) room.players[id].setRole('seeker');
    });
    room.pastKeepers.add(finalKeeperId);
    room.currentSession = new (require('./GameSession'))();

    // Check for game over
    if (room.isGameOver()) {
        room.endGame();
    }

    // Final scoreboard
    console.log(`\n📊 Final Scores:`);
    for (const id in room.players) {
        const p = room.players[id];
        console.log(`${p.username}: ${p.gameScore}`);
    }

    console.log('\n✅ Full game simulation complete.\n');
    process.exit();
})();
