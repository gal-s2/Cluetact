class GameSession {
    constructor() {
        this.roundNum = 1;
        this.word = null;
        this.guesses = [];
        this.status = 'waiting';
    }

    setKeeperWord(word) {
        this.keeperWord = word;
        this.status = 'active';
    }

    addGuess(userId, word) {
        this.guesses.push({ userId, word, time: new Date() });
    }

    endSession() {
        this.status = 'ended';
    }
}

module.exports = GameSession;