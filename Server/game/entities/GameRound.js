const Clue = require("./Clue");
const Guess = require("./Guess");
const { ROLES } = require("../constants");

class GameRound {
    constructor(players) {
        this.roundNum = 1;
        this.keeperWord = null;
        this.revealedLetters = "";
        this.clues = [];
        this.guesses = [];
        this.status = "waiting";
    }

    setKeeperWord(word) {
        this.keeperWord = word.toUpperCase();
        this.revealedLetters = this.keeperWord[0];
        this.status = "waiting";
    }

    getActiveClue() {
        const numOfClues = this.clues.length;
        console.log(`Number of clues: ${numOfClues}`);
        return numOfClues > 0 ? this.clues[numOfClues - 1] : null;
    }

    addGuess(username, word) {
        this.guesses.push(new Guess(username, word.toLowerCase()));
    }

    addClue(clueGiverUsername, clueWord, clueDefinition) {
        const clue = new Clue(clueGiverUsername, clueWord, clueDefinition);
        this.clues.push(clue);
        this.guesses = [];
    }

    tryBlockClue(wordGuess, keeperUsername) {
        const lowerGuess = wordGuess.toLowerCase();
        const activeClue = this.getActiveClue();
        console.log("Trying to block clue :", activeClue, "with guess:", lowerGuess);
        if (!activeClue.blocked && activeClue.word === lowerGuess) {
            activeClue.blocked = true;
            activeClue.active = false;
            return {
                success: true,
                blockedClue: activeClue,
            };
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
