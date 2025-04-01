const prompt = require('prompt-sync')();
const Room = require('./Room');
const isValidEnglishWord = require('./validateWord');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// --- Setup players and room
const usernames = {
    u1: 'Alice',
    u2: 'Bob',
    u3: 'Charlie'
};
const keeperId = 'u1';
const seekers = ['u2', 'u3'];

const room = new Room(1, 'Created', keeperId, seekers, usernames);

// --- Game Loop
(async () => {
    console.log(`\n🎮 Game started with players: ${Object.values(usernames).join(', ')}`);

    while (!room.isGameOver()) {
        console.log(`\n👑 Current keeper: ${usernames[room.keeperId]}`);
        
        // Ask keeper for a valid word
        let wordSet = false;
        while (!wordSet) {
            const keeperWord = prompt(`🔑 ${usernames[room.keeperId]}, enter your secret word: `);
            wordSet = await room.setKeeperWordWithValidation(keeperWord);
            if (!wordSet) console.log('❌ Not a valid English word. Try again.\n');
        }

        let roundOver = false;

        while (!roundOver) {
            const clueGiverId = prompt(`💬 Who gives the clue? (u1/u2/u3): `);
            const clueWord = prompt(`📘 What is the clue word (must start with '${room.currentSession.revealedLetters}')? `);
            room.startNewClueRound(clueGiverId, clueWord);

            const guesserId = prompt(`🧠 Who guesses first? (u1/u2/u3): `);
            const guess = prompt(`🤔 What word does ${usernames[guesserId]} guess? `);

            const startTime = Date.now();
            await delay(500); // Simulated thinking delay
            const timeElapsed = (Date.now() - startTime) / 1000;

            room.submitGuess(guesserId, guess);

            if (room.currentSession.status === 'waiting') {
                if (room.currentSession.revealedLetters.length === room.currentSession.keeperWord.length) {
                    console.log('✅ Full word revealed!');
                    roundOver = true;

                    const nextKeeperId = room.getNextKeeper();
                    room.keeperId = nextKeeperId;
                    room.players[nextKeeperId].setRole('keeper');
                    Object.keys(room.players).forEach(id => {
                        if (id !== nextKeeperId) room.players[id].setRole('seeker');
                    });
                    room.pastKeepers.add(nextKeeperId);
                    room.currentSession = new (require('./GameSession'))();
                }
            }
        }
    }

    room.endGame();

    console.log('\n📊 Final Scores:');
    for (const id in room.players) {
        console.log(`${usernames[id]}: ${room.players[id].gameScore}`);
    }

    console.log('\n✅ Manual test complete.');
})();
