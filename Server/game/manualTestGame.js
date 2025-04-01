
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
    console.log(`\nGame started with players: ${Object.values(usernames).join(', ')}`);

    while (!room.isGameOver()) {
        console.log(`\n Current keeper: ${usernames[room.keeperId]}`);

        // Ask keeper for a valid word
        let wordSet = false;
        while (!wordSet) {
            const keeperWord = prompt(` ${usernames[room.keeperId]}, enter your secret word: `);
            wordSet = await room.setKeeperWordWithValidation(keeperWord);
            if (!wordSet) console.log(' Not a valid English word. Try again.\n');
        }

        let roundOver = false;

        while (!roundOver) {
            // Ask for clue giver and clue word + definition
            let clueAccepted = false;
            while (!clueAccepted) {
                const clueGiverId = prompt(` Who gives the clue? (u1/u2/u3): `);
                if (clueGiverId === room.keeperId) {
                    console.log(` Keeper (${usernames[clueGiverId]}) cannot give clues.`);
                    continue;
                }

                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const clueWord = prompt(` What is the clue word? (must start with '${lastLetter}'): `);
                if (!clueWord.toLowerCase().startsWith(lastLetter)) {
                    console.log(` "${clueWord}" must start with '${lastLetter}'. Try again.`);
                    continue;
                }

                const clueDefinition = prompt(` Enter the definition for "${clueWord}": `);
                clueAccepted = room.startNewClueRound(clueGiverId, clueWord, clueDefinition);
                if (!clueAccepted) console.log(' Failed to start clue round. Try again.');
                else console.log(` Definition: "${clueDefinition}"`);
            }

            // Ask for guesses (allow multiple guess attempts)
            let guessAccepted = false;
            while (!guessAccepted) {
                const guesserId = prompt(` Who guesses the clue word? (u1/u2/u3): `);
                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const guess = prompt(` What word does ${usernames[guesserId]} guess? (must start with '${lastLetter}'): `);
                if (!guess.toLowerCase().startsWith(lastLetter)) {
                    console.log(`"${guess}" must start with '${lastLetter}'. Try again.`);
                    continue;
                }

                guessAccepted = room.submitGuess(guesserId, guess);
                if (!guessAccepted) console.log('Guess rejected or incorrect.');
            }

            if (
                room.currentSession.keeperWord &&
                room.currentSession.revealedLetters.length === room.currentSession.keeperWord.length
            ) {
                console.log(' Keeper word fully revealed!');
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

    room.endGame();

    console.log('\n Final Scores:');
    for (const id in room.players) {
        console.log(`${usernames[id]}: ${room.players[id].gameScore}`);
    }

    console.log('\n Manual test complete.');
})();
