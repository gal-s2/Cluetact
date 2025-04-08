const readline = require('readline');
const Room = require('./Room');
const isValidEnglishWord = require('./validateWord');
const Logger = require('./Logger');
const GameSession = require('./GameSession');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Readline setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

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
    debugger; // 🛑 VS Code will pause here when launched with the debugger

    Logger.logRoomCreated(room.roomId, usernames);

    while (!room.isGameOver()) {
        Logger.logCurrentKeeper(room.roomId, usernames[room.keeperId]);

        if (!room.currentSession.keeperWord) {
            let wordSet = false;
            while (!wordSet) {
                const keeperWord = await ask(`🔑 ${usernames[room.keeperId]}, enter your secret word: `);
                wordSet = await room.setKeeperWordWithValidation(keeperWord);
            }
        }

        let roundOver = false;

        while (!roundOver) {
            if (!room.currentSession.keeperWord) break;

            // Ask for clue giver and clue word + definition
            let clueGiverId = null;
            let clueAccepted = false;

            while (!clueAccepted) {
                const seekersUsernames = Object.keys(room.players).filter(id => id !== room.keeperId);
                clueGiverId = await ask(`💬 Who gives the clue? (${seekersUsernames.join('/')}) : `);

                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const clueWord = await ask(`📘 What is the clue word (must start with '${lastLetter}')? `);
                const clueDefinition = await ask(`💡 Enter the definition for "${clueWord}": `);

                clueAccepted = room.startNewClueRound(clueGiverId, clueWord, clueDefinition);
                if (!clueAccepted) clueGiverId = null; // retry
            }

            // Ask for guesses
            let guessAccepted = false;
            while (!guessAccepted) {
                const eligibleGuessers = Object.keys(room.players).filter(id => id !== clueGiverId);

                const guesserId = await ask(`🧠 Who guesses first? (${eligibleGuessers.join('/')}) : `);
                const lastLetter = room.currentSession.revealedLetters.slice(-1).toLowerCase();
                const guess = await ask(`🤔 What word does ${usernames[guesserId]} guess? (must start with '${lastLetter}'): `);

                const result = room.submitGuess(guesserId, guess);
                guessAccepted = result.correct;

                if (result.correct && !result.revealed) {
                    console.log(`❗ The guess was correct, but no letter was revealed.`);
                }
            }

            // Check if all letters were revealed
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
                room.currentSession = new GameSession();
            }
        }
    }

    room.endGame();

    for (const id in room.players) {
        Logger.logFinalScore(usernames[id], room.players[id].gameScore);
    }

    Logger.logManualTestComplete();
    rl.close();
})();
