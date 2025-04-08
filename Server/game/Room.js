// Updated Room.js with prevention for reused clue words across session
const Player = require('./Player');
const GameSession = require('./GameSession');
const isValidEnglishWord = require('./validateWord');
const Logger = require('./Logger');

const MAX_RACE_TIME = 10000;
const BASE_POINTS = 15;
const PENALTY_RATE = 2;
const CLUE_FAIL_PENALTY = 5;

class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds, usernamesMap = {}) {
        this.roomId = roomId;
        this.status = status;
        this.keeperId = keeperId;
        this.players = {};
        this.currentSession = new GameSession();
        this.turnQueue = listOfSeekersIds.slice();
        this.usedWords = new Set();

        const keeper = new Player(keeperId, usernamesMap[keeperId] || 'Unknown');
        keeper.setRole('keeper');
        this.players[keeperId] = keeper;

        listOfSeekersIds.forEach((id) => {
            const seeker = new Player(id, usernamesMap[id] || 'Unknown');
            seeker.setRole('seeker');
            this.players[id] = seeker;
        });

        this.pastKeepers = new Set();
        this.pastKeepers.add(keeperId);
    }

    updateStatus(status) {
        this.status = status;
    }

    startNewClueRound(clueGiverId, clueWord, clueDefinition) {
        if (!this.currentSession.keeperWord) {
            Logger.logCannotClueWithoutKeeperWord(this.roomId);
            return false;
        }

        if (clueGiverId === this.keeperId) {
            Logger.logClueNotAllowed(this.roomId);
            return false;
        }

        const lastLetter = this.currentSession.revealedLetters.slice(-1).toLowerCase();
        if (!clueWord.toLowerCase().startsWith(lastLetter)) {
            Logger.logInvalidClue(this.roomId, clueWord, lastLetter);
            return false;
        }

        if (this.usedWords.has(clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return false;
        }

        // ✅ Save the clue word to the global usedWords set
        this.usedWords.add(clueWord.toLowerCase());

        this.currentSession.setClue(clueGiverId, clueWord, clueDefinition);
        Logger.logClueSet(this.roomId, clueGiverId, clueDefinition);

        this.raceTimer = setTimeout(() => {
            this.handleClueTimeout();
        }, MAX_RACE_TIME);

        return true;
    }

    submitGuess(userId, guessWord) {
        const session = this.currentSession;
        const revealed = session.revealedLetters;
        const lastLetter = revealed[revealed.length - 1].toLowerCase();
        const guessFirstLetter = guessWord[0].toLowerCase();

        if (guessFirstLetter !== lastLetter) {
            Logger.logInvalidGuess(this.roomId, guessWord, lastLetter);
            return { correct: false };
        }

        if (session.guesses.find(g => g.word.toLowerCase() === guessWord.toLowerCase())) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            return { correct: false };
        }

        session.addGuess(userId, guessWord);
        this.usedWords.add(guessWord.toLowerCase());

        if (guessWord.toLowerCase() === session.clueTargetWord?.toLowerCase()) {
            const timeElapsed = (new Date() - session.raceStartTime) / 1000;
            this.usedWords.add(guessWord.toLowerCase());

            const isKeeper = userId === this.keeperId;
            if (isKeeper) {
                this.handleKeeperClueGuess(userId);
                clearTimeout(this.raceTimer);
                return { correct: true, revealed: false };
            } else {
                this.handleCorrectGuess(userId, timeElapsed);
                clearTimeout(this.raceTimer);
                return { correct: true, revealed: true };
            }
        }

        if (guessWord.toLowerCase() === session.keeperWord?.toLowerCase()) {
            this.handleKeeperWordGuess(userId, guessWord);
            return { correct: true, revealed: false };
        }

        return { correct: false };
    }

    handleCorrectGuess(guesserId, timeElapsed) {
        const session = this.currentSession;
        const clueGiverId = session.clueGiverId;

        let pointsEarned = Math.ceil(BASE_POINTS - (timeElapsed * PENALTY_RATE));
        if (pointsEarned < 1) pointsEarned = 1;

        this.players[guesserId].addScore(pointsEarned);
        this.players[clueGiverId].addScore(pointsEarned);

        const isWordFullyRevealed = session.revealNextLetter();

        Logger.logGuessCorrect(this.roomId, guesserId, pointsEarned);
        Logger.logRevealedLetters(this.roomId, session.revealedLetters);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';

        if (isWordFullyRevealed) {
            const currentKeeperId = this.keeperId;
            this.pastKeepers.add(currentKeeperId);

            const nextKeeper = this.getNextKeeper();
            this.keeperId = nextKeeper;
            this.players[nextKeeper].setRole('keeper');

            Object.keys(this.players).forEach(id => {
                if (id !== nextKeeper) this.players[id].setRole('seeker');
            });

            this.currentSession = new GameSession();
            Logger.logNextKeeper(this.roomId, this.players[nextKeeper].username);

            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    handleKeeperClueGuess(keeperId) {
        const session = this.currentSession;
        Logger.logKeeperGuessedClue(this.roomId, keeperId);
        this.players[keeperId].addScore(2);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    }

    handleKeeperWordGuess(userId, guessWord) {
        Logger.logKeeperWordGuessAttempt(this.roomId, userId);

        if (this.currentSession.status === 'ended') return;

        if (this.currentSession.keeperWord.toLowerCase() === guessWord.toLowerCase()) {
            this.players[userId].addScore(50);
            this.currentSession.endSession();
        } else {
            this.players[userId].addScore(-20);
        }
    }

    handleClueTimeout() {
        const session = this.currentSession;
        const clueGiverId = session.clueGiverId;

        Logger.logTimeUp(this.roomId);
        this.players[clueGiverId].addScore(-CLUE_FAIL_PENALTY);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    }

    getNextKeeper() {
        const currentIndex = this.turnQueue.indexOf(this.keeperId);
        const nextIndex = (currentIndex + 1) % this.turnQueue.length;
        return this.turnQueue[nextIndex];
    }

    isGameOver() {
        const totalPlayers = Object.keys(this.players).length;
        return this.pastKeepers.size >= totalPlayers;
    }

    endGame() {
        this.status = 'ended';

        let maxScore = -Infinity;
        let winners = [];

        for (const player of Object.values(this.players)) {
            if (player.gameScore > maxScore) {
                maxScore = player.gameScore;
                winners = [player];
            } else if (player.gameScore === maxScore) {
                winners.push(player);
            }
        }

        Logger.logGameOver(this.roomId, winners.map(p => p.username));
    }

    async setKeeperWordWithValidation(word) {
        const valid = await isValidEnglishWord(word);
        if (!valid) {
            Logger.logInvalidKeeperWord(this.roomId, word);
            return false;
        }

        this.currentSession.setKeeperWord(word);
        Logger.logKeeperWordSet(this.roomId, word);
        return true;
    }
}

module.exports = Room;
