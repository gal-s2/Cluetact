const Room = require('../Room');

// Mock Logger to capture logs for output
jest.mock('../Logger', () => ({
    logGameStart: jest.fn((usernames) => console.log(`Game started with players: ${Object.values(usernames).join(', ')}`)),
    logCurrentKeeper: jest.fn((roomId, keeperName) => console.log(`Current Keeper: ${keeperName}`)),
    logFinalScore: jest.fn((username, score) => console.log(`Final Score - ${username}: ${score}`)),
    logManualTestComplete: jest.fn(() => console.log('Manual test complete')),
    logClueSet: jest.fn((roomId, clueGiverId, clueDefinition) => console.log(`Clue set by ${clueGiverId}: ${clueDefinition}`)),
    logGuessCorrect: jest.fn((roomId, guesserId, points) => console.log(`Correct guess by ${guesserId}, earned ${points} points`)),
    logNextKeeper: jest.fn((roomId, nextKeeperName) => console.log(`Next Keeper: ${nextKeeperName}`)),
    logGameOver: jest.fn((roomId, winners) => console.log(`Game Over! Winners: ${winners.join(', ')}`)),
    logKeeperWordSet: jest.fn((roomId, word) => console.log(`Keeper word set for room ${roomId}: ${word}`)),
    logKeeperWordGuessAttempt: jest.fn((roomId, userId) => console.log(`Keeper word guess attempt by user ${userId} in room ${roomId}`)),
    logTimeUp: jest.fn((roomId) => console.log(`Time is up for room ${roomId}`)),
}));

describe('Game Simulation with Real Words', () => {
    const usernames = { u1: 'Alice', u2: 'Bob', u3: 'Charlie' };
    const keeperId = 'u1';
    const seekers = ['u2', 'u3'];
    let room;

    beforeEach(() => {
        jest.useFakeTimers(); // Use fake timers
        room = new Room(1, 'Created', keeperId, seekers, usernames);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers(); // Run pending timers
        jest.useRealTimers(); // Restore real timers
    });

    const simulateGameRound = async (roundNumber, keeperWord, clueWord, guessWord) => {
        console.log(`\n--- Round ${roundNumber} ---`);

        // Set keeper word
        console.log(`🔑 Keeper (${usernames[room.keeperId]}) sets the word: ${keeperWord}`);
        await room.setKeeperWordWithValidation(keeperWord);

        // Simulate clue round
        const clueGiverId = 'u2';
        const clueDefinition = `Definition for ${clueWord}`;
        console.log(`💬 Clue Giver (${usernames[clueGiverId]}) gives clue: ${clueWord} (${clueDefinition})`);
        room.startNewClueRound(clueGiverId, clueWord, clueDefinition);

        // Simulate guesses
        const guesserId = 'u3';
        console.log(`🧠 Guesser (${usernames[guesserId]}) guesses: ${guessWord}`);
        const guessAccepted = room.submitGuess(guesserId, guessWord);

        if (guessAccepted) {
            console.log(`✅ Guess accepted!`);
        } else {
            console.log(`❌ Guess rejected!`);
        }
    };

    test('Simulate 8 iterations of games with real words', async () => {
        const rounds = [
            { keeperWord: 'apple', clueWord: 'ant', guessWord: 'apple' },
            { keeperWord: 'banana', clueWord: 'boat', guessWord: 'banana' },
            { keeperWord: 'cherry', clueWord: 'cat', guessWord: 'cherry' },
            { keeperWord: 'dragon', clueWord: 'dog', guessWord: 'dragon' },
            { keeperWord: 'elephant', clueWord: 'eagle', guessWord: 'elephant' },
            { keeperWord: 'falcon', clueWord: 'fish', guessWord: 'falcon' },
            { keeperWord: 'grape', clueWord: 'goat', guessWord: 'grape' },
            { keeperWord: 'honey', clueWord: 'hat', guessWord: 'honey' },
        ];

        for (let i = 0; i < rounds.length; i++) {
            const { keeperWord, clueWord, guessWord } = rounds[i];
            await simulateGameRound(i + 1, keeperWord, clueWord, guessWord);

            // Check if the round is over and roles are rotated
            const nextKeeperId = room.getNextKeeper();
            console.log(`🔄 Rotating roles. Next Keeper: ${usernames[nextKeeperId]}`);
            room.keeperId = nextKeeperId;
            room.players[nextKeeperId].setRole('keeper');
            Object.keys(room.players).forEach(id => {
                if (id !== nextKeeperId) room.players[id].setRole('seeker');
            });
            room.pastKeepers.add(nextKeeperId);
            room.currentSession = new (require('../GameSession'))();
        }

        // End the game and verify final scores
        room.endGame();
        console.log(`\n--- Final Scores ---`);
        for (const id in room.players) {
            console.log(`${usernames[id]}: ${room.players[id].gameScore}`);
        }
        console.log(`Game Over!`);
    });
});