class Logger {

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
        console.log(`[Room ${roomId}] Revealed: ${revealed}\n`);
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
    static logInvalidSeekerWord(roomId, word) {
        console.log(`[Room ${roomId}] Seeker word "${word}" is invalid.`);
    }
    static logCurrentKeeper(roomId, keeperName) {
        console.log(`\nCurrent keeper: ${keeperName}`);
    }
    
    static logFinalScore(username, score) {
        console.log(` ${username}: ${score} pts`);
    }
    
    static logManualTestComplete() {
        console.log(`Manual test complete.`);
    }
    static logCannotClueWithoutKeeperWord(roomId) {
        console.log(`[Room ${roomId}]  Cannot give clue — keeper hasn't set a word yet.`);
    }

    static logRoomCreated(roomId, players) {
        console.log(`Room ${roomId} created with ${Object.values(players).join(', ')}`);
    }
    static logClueWordAlreadyUsed(roomId, word) {
        console.log(`[Room ${roomId}] ❌ Clue word "${word}" was already used in this session.`);
    }
    
    
    
    
}

module.exports = Logger;
