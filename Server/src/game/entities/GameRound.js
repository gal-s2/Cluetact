const Clue = require("./Clue");
const Guess = require("./Guess");

class GameRound {
    constructor() {
        this.roundNum = 1;
        this.keeperWord = null;
        this.revealedLetters = "";
        this.clues = [];
        this.guesses = [];
        this.status = "waiting";
        this.countOfClueSubmittersInPrefix = 0;
    }

    setKeeperWord(word) {
        this.keeperWord = word.toUpperCase();
        this.revealedLetters = this.keeperWord[0];
        this.status = "waiting";
    }

    getActiveClue() {
        const numOfClues = this.clues.length;
        return numOfClues > 0 ? this.clues[numOfClues - 1] : null;
    }

    resetCluesHistory() {
        this.clues = [];
    }
    resetGuessesHistory() {
        this.guesses = [];
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
