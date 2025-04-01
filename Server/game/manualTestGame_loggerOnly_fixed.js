
const prompt = require('prompt-sync')();
const Room = require('./Room');
const isValidEnglishWord = require('./validateWord');
const Logger = require('./Logger');

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
    Logger.logGameStart(usernames);

    while (!room.isGameOver()) {
        Logger.logCurrentKeeper(room.roomId, usernames[room.keeperId]);

        if (!room.currentSession.keeperWord) {
            let wordSet = false;
            while (!wordSet) {
                const keeperWord = prompt(`🔑 ${usernames[room.keeperId]}, enter your secret word: `);
                wordSet = await room.setKeeperWordWithValidation(keeperWord);
            }
        }

        let roundOver = false;

        while (!roundOver) {
            if (!room.currentSession.keeperWord) break;

            // Ask for clue giver and clue word + definition
            let clueAccepted = false;
            while (!clueAccepted) {
                const clueGiverId = prompt(`💬 Who gives the clue? (u1/u2/u3): `);
                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const clueWord = prompt(`📘 What is the clue word (must start with '${lastLetter}')? `);
                const clueDefinition = prompt(`💡 Enter the definition for "${clueWord}": `);

                clueAccepted = room.startNewClueRound(clueGiverId, clueWord, clueDefinition);
            }

            // Ask for guesses (allow multiple guess attempts)
            let guessAccepted = false;
            while (!guessAccepted) {
                const guesserId = prompt(`🧠 Who guesses first? (u1/u2/u3): `);
                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const guess = prompt(`🤔 What word does ${usernames[guesserId]} guess? (must start with '${lastLetter}'): `);

                guessAccepted = room.submitGuess(guesserId, guess);
            }

            if (
                room.currentSession.keeperWord &&
                room.currentSession.revealedLetters.length === room.currentSession.keeperWord.length
            ) {
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

    for (const id in room.players) {
        Logger.logFinalScore(usernames[id], room.players[id].gameScore);
    }

    Logger.logManualTestComplete();
})();
