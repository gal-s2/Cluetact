class GameSession {
    constructor() {
        this.roundNum = 1;
        this.keeperWord = null; // The full word chosen by the keeper (lets say dog)
        this.revealedLetters = ""; // Current revealed part (e.g., "d", "do", etc.)
        this.clueGiverId = null; // ID of the seeker who gave the clue
        this.clueDefinition = null;
        this.clueTargetWord = null; // The word the clue is describing
        this.raceStartTime = null; // When the keeper/seeker race started
        this.guesses = []; // List of { userId, word, time }
        this.status = "waiting"; // "waiting", "race", "ended"
    }

    setKeeperWord(word) {
        this.keeperWord = word;
        this.revealedLetters = word[0]; // Reveal the first letter
        this.status = "waiting";
    }

    addGuess(userId, word) {
        this.guesses.push({ userId, word, time: new Date() });
    }

    setClue(clueGiverId, clueTargetWord) {
        this.clueGiverId = clueGiverId;
        this.clueTargetWord = clueTargetWord;
        this.raceStartTime = new Date();
        this.status = "race";
        this.guesses = []; // clear guesses for this race
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

    endSession() {
        this.status = "ended";
    }
}

module.exports = GameSession;
