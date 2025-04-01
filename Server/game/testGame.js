const Room = require('./Room');

const usernamesMap = {
    u1: 'Alice',
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
    console.log(`\n🔑 Alice sets secret word: "dog"`);
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Bob defines: "A bird that quacks" (word: "duck")`);
    room.startNewClueRound('u2', 'duck');
    await delay(2000);
    console.log(`⚡ Charlie guesses: "duck"`);
    room.submitGuess('u3', 'duck');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Charlie defines: "You open it to enter a room" (word: "door")`);
    room.startNewClueRound('u3', 'door');
    await delay(1500);
    console.log(`⚡ Bob guesses: "door"`);
    room.submitGuess('u2', 'door');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);
    // Last letter now revealed → keeper should rotate automatically

    //
    // ROUND 2 – Keeper: Bob – Word: sun
    //
    room.currentSession.setKeeperWord('sun');
    console.log(`\n🔁 New keeper: Bob`);
    console.log(`🔑 Sets secret word: "sun"`);
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Alice defines: "Long reptile that hisses" (word: "snake")`);
    room.startNewClueRound('u1', 'snake');
    await delay(1800);
    console.log(`⚡ Charlie guesses: "snake"`);
    room.submitGuess('u3', 'snake');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Charlie defines: "Opposite of moon" (word: "sunny")`);
    room.startNewClueRound('u3', 'sunny');
    await delay(1400);
    console.log(`⚡ Alice guesses: "sunny"`);
    room.submitGuess('u1', 'sunny');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);
    // "sun" is now fully revealed → auto-rotate

    //
    // ROUND 3 – Keeper: Charlie – Word: pen
    //
    room.currentSession.setKeeperWord('pen');
    console.log(`\n🔁 Final keeper: Charlie`);
    console.log(`🔑 Sets secret word: "pen"`);
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Bob defines: "You write with it" (word: "pencil")`);
    room.startNewClueRound('u2', 'pencil');
    await delay(2500);
    console.log(`⚡ Alice guesses: "pencil"`);
    room.submitGuess('u1', 'pencil');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);

    console.log(`\n💬 Alice defines: "Another name for prison" (word: "penitentiary")`);
    room.startNewClueRound('u1', 'penitentiary');
    await delay(2000);
    console.log(`⚡ Bob guesses: "penitentiary"`);
    room.submitGuess('u2', 'penitentiary');
    console.log(`🔤 Revealed: ${room.currentSession.revealedLetters}`);
    // Word "pen" fully revealed → game should end here

    //
    // ✅ End Game if All Keepers Played
    //
    if (room.isGameOver()) {
        room.endGame();
    }

    //
    // 📊 Final Scores
    //
    console.log(`\n📊 Final Scores:`);
    for (const id in room.players) {
        const p = room.players[id];
        console.log(`${p.username}: ${p.gameScore}`);
    }

    console.log('\n✅ Full game simulation complete.\n');
    process.exit();
})();
