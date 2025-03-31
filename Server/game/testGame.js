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

    //
    // ROUND 1 – Keeper: Alice – Word: dog
    //
    room.currentSession.setKeeperWord('dog');
    console.log(`\n ${usernamesMap[keeperId]} sets secret word: "dog"`);
    console.log(` Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n Bob defines: "A bird that quacks" (word: "duck")`);
    room.startNewClueRound('u2', 'duck');
    await delay(2000);
    console.log(`⚡ Charlie guesses: "duck"`);
    room.submitGuess('u3', 'duck');
    console.log(` Revealed letters: ${room.currentSession.revealedLetters}`);

    console.log(`\n Charlie defines: "You open it to enter a room" (word: "door")`);
    room.startNewClueRound('u3', 'door');
    await delay(1500);
    console.log(`⚡ Bob guesses: "door"`);
    room.submitGuess('u2', 'door');
    console.log(` Revealed letters: ${room.currentSession.revealedLetters}`);

    console.log(`\n🎯 Bob attempts to guess keeper word: "dog"`);
    room.submitGuess('u2', 'dog');

    //
    // ROUND 2 – Keeper: Bob – Word: sun
    //
    const nextKeeperId = room.getNextKeeper();
    room.keeperId = nextKeeperId;
    room.players[nextKeeperId].setRole('keeper');
    Object.keys(room.players).forEach(id => {
        if (id !== nextKeeperId) room.players[id].setRole('seeker');
    });
    room.pastKeepers.add(nextKeeperId);
    room.currentSession = new (require('./GameSession'))();

    room.currentSession.setKeeperWord('sun');
    console.log(`\n New keeper: ${usernamesMap[nextKeeperId]}`);
    console.log(` Sets secret word: "sun"`);
    console.log(` Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n Alice defines: "Long reptile that hisses" (word: "snake")`);
    room.startNewClueRound('u1', 'snake');
    await delay(1800);
    console.log(`⚡ Charlie guesses: "snake"`);
    room.submitGuess('u3', 'snake');
    console.log(` Revealed letters: ${room.currentSession.revealedLetters}`);

    console.log(`\n Charlie guesses keeper word: "sun"`);
    room.submitGuess('u3', 'sun');

    //
    // ROUND 3 – Keeper: Charlie – Word: pen
    //
    const finalKeeperId = room.getNextKeeper();
    room.keeperId = finalKeeperId;
    room.players[finalKeeperId].setRole('keeper');
    Object.keys(room.players).forEach(id => {
        if (id !== finalKeeperId) room.players[id].setRole('seeker');
    });
    room.pastKeepers.add(finalKeeperId);
    room.currentSession = new (require('./GameSession'))();

    room.currentSession.setKeeperWord('pen');
    console.log(`\n Final keeper: ${usernamesMap[finalKeeperId]}`);
    console.log(` Sets secret word: "pen"`);
    console.log(` Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n Bob defines: "You write with it" (word: "pencil")`);
    room.startNewClueRound('u2', 'pencil');
    await delay(2500);
    console.log(` Alice guesses: "pencil"`);
    room.submitGuess('u1', 'pencil');
    console.log(` Revealed letters: ${room.currentSession.revealedLetters}`);

    console.log(`\n🎯 Alice guesses keeper word: "pen"`);
    room.submitGuess('u1', 'pen');

    //
    //  NOW end game AFTER all 3 players were keepers
    //
    if (room.isGameOver()) {
        room.endGame();
    }

    //
    //  Final Scores
    //
    console.log(`\n Final Scores:`);
    for (const id in room.players) {
        const p = room.players[id];
        console.log(`${p.username}: ${p.gameScore}`);
    }

    console.log('\n Full game simulation complete.\n');
    process.exit();
})();
