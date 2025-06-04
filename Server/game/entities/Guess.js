class Guess {
    constructor(guesserUsername, word) {
        this.guesserUsername = guesserUsername;
        this.word = word.toLowerCase();
    }
}

module.exports = Guess;
