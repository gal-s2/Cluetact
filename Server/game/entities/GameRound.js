const Clue = require("./Clue");

class GameRound {
    constructor() {
        this.roundNum = 1;
        this.keeperWord = null; // The full word chosen by the keeper (lets say dog)
        this.revealedLetters = ""; // Current revealed part (e.g., "d", "do", etc.)
        this.clues = [];
        this.raceStartTime = null; // When the keeper/seeker race started
        this.guesses = []; // List of { userId, word, time }
        this.status = "waiting"; // "waiting", "race", "ended"
    }

    setKeeperWord(word) {
        this.keeperWord = word.toUpperCase();
        this.revealedLetters = this.keeperWord[0]; // Reveal the first letter
        this.status = "waiting";
    }

    addGuess(userId, word) {
        this.guesses.push({ userId, word, time: new Date() });
    }

    addClue(clueGiverId, clueWord, clueDefinition) {
        const clue = new Clue(clueGiverId, clueWord, clueDefinition);
        this.clues.push(clue);
        this.raceStartTime = new Date();
        this.status = "race";
        this.guesses = [];
    }

    tryBlockClue(wordGuess, keeperUsername) {
        const lowerGuess = wordGuess.toLowerCase();

        for (const clue of this.clues) {
            if (!clue.blocked && clue.word === lowerGuess) {
                clue.blocked = true;
                return {
                    success: true,
                    blockedClue: {
                        definition: clue.definition,
                        from: clue.from,
                        word: clue.word,
                    },
                };
            }
        }

        return { success: false };
    }

    revealNextLetter() {
        const currentLength = this.revealedLetters.length;
        if (this.keeperWord && currentLength < this.keeperWord.length) {
            this.revealedLetters += this.keeperWord[currentLength];

            // Return true if this was the last letter
            return this.revealedLetters.length === this.keeperWord.length;
        }

        return false; // Already fully revealed
    }

    resetCluesHistory() {
        this.clues = [];
    }

    getClues() {
        return this.clues;
    }

    getClueGiverUsernameByClueId(clueId) {
        return this.clues.find((clue) => clue.id === clueId)?.from;
    }

    endSession() {
        this.status = "ended";
    }
}

module.exports = GameRound;
