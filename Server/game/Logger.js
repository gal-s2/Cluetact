class Logger {
    static logGameStart(usernames) {
        console.log(`\n Game started with players: ${Object.values(usernames).join(', ')}`);
    }

    static logKeeperWordSet(roomId, word) {
        console.log(`[Room ${roomId}]  Keeper word set: "${word}"`);
    }

    static logClueSet(roomId, clueGiverId, definition) {
        console.log(`[Room ${roomId}]  Clue set by ${clueGiverId}: "${definition}"`);
    }

    static logInvalidClue(roomId, clueWord, expectedLetter) {
        console.log(`[Room ${roomId}]  Clue word "${clueWord}" must start with '${expectedLetter}'`);
    }

    static logGuessCorrect(roomId, userId, points) {
        console.log(`[Room ${roomId}] ${userId} guessed the clue word. +${points} pts`);
    }

    static logRevealedLetters(roomId, revealed) {
        console.log(`[Room ${roomId}] Revealed: ${revealed}`);
    }

    static logNextKeeper(roomId, nextKeeperName) {
        console.log(`[Room ${roomId}] Word fully revealed. Next keeper: ${nextKeeperName}`);
    }

    static logGameOver(roomId, winners) {
        console.log(`[Room ${roomId}] Game Over. Winner(s):`, winners);
    }

    static logInvalidGuess(roomId, guessWord, expectedLetter) {
        console.log(`[Room ${roomId}]  Invalid guess "${guessWord}" — must start with '${expectedLetter}'`);
    }

    static logDuplicateGuess(roomId, guessWord) {
        console.log(`[Room ${roomId}] ⚠️ Word "${guessWord}" was already guessed.`);
    }

    static logTimeUp(roomId) {
        console.log(`[Room ${roomId}]  Time's up! No one guessed the clue word.`);
    }
    static logClueNotAllowed(roomId) {
        console.log(`[Room ${roomId}]  Keeper cannot give clues.`);
    }
    
    static logKeeperGuessedClue(roomId, keeperId) {
        console.log(`[Room ${roomId}]  Keeper ${keeperId} guessed the clue word.`);
    }
    
    static logKeeperWordGuessAttempt(roomId, userId) {
        console.log(`[Room ${roomId}] ${userId} attempted to guess the keeper's word!`);
    }
    
    static logInvalidKeeperWord(roomId, word) {
        console.log(`[Room ${roomId}] Keeper word "${word}" is invalid.`);
    }
    
}

module.exports = Logger;
