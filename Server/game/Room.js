const Player = require("./Player");
const GameSession = require("./GameSession");
const isValidEnglishWord = require("../utils/validateWord");
const Logger = require("./Logger");

const MAX_RACE_TIME = 10000;
const BASE_POINTS = 15;
const PENALTY_RATE = 2;
const CLUE_FAIL_PENALTY = 5;

class Room {
    constructor(roomId, status, keeperUsername, seekersUsernames) {
        this.roomId = roomId;
        this.status = status;
        this.keeperUsername = keeperUsername;
        this.players = {};
        this.currentSession = new GameSession();
        this.turnQueue = seekersUsernames.slice();
        this.usedWords = new Set();

        // Keeper Creation
        const keeper = new Player(keeperUsername);
        keeper.setRole("keeper");
        this.players[keeperUsername] = keeper;

        // Seekers Creation
        seekersUsernames.forEach((username) => {
            const seeker = new Player(username);
            seeker.setRole("keeper"); //hardcoded - need to change back to seeker
            this.players[username] = seeker;
        });

        this.pastKeepers = new Set();
        this.pastKeepers.add(keeperUsername);
    }

    /**
     * Get the part of the word that is currently revealed to all players in room
     * @returns {string}
     */
    getRevealedLetters() {
        return this.currentSession.revealedLetters;
    }

    /**
     * returns player object by username
     * @param {string} username
     * @returns {Player}
     */
    getPlayerByUsername(username) {
        return this.players[username];
    }

    updateStatus(status) {
        this.status = status;
    }

    async waitForKeeperWord(getWordFromSocket) {
        while (!this.currentSession.keeperWord) {
            const word = await getWordFromSocket(this.keeperUsername);
            await this.setKeeperWordWithValidation(word);
        }
    }

    async runGame(prompt) {
        while (!this.isGameOver()) {
            Logger.logCurrentKeeper(this.roomId, this.keeperUsername);

            while (!this.currentSession.keeperWord) {
                const word = await prompt(
                    `🔑 ${this.keeperUsername}, enter your secret word: `
                );
                await this.waitForKeeperWord(getWordFromSocket);
            }

            let roundOver = false;

            while (!roundOver) {
                if (!this.currentSession.keeperWord) break;

                let clueAccepted = false;
                let clueGiverId = null;
                while (!clueAccepted) {
                    const seekers = Object.keys(this.players).filter(
                        (id) => id !== this.keeperUsername
                    );
                    clueGiverId = await prompt(
                        ` Who gives the clue? (${seekers.join("/")}) : `
                    );
                    const lastLetter = this.currentSession.revealedLetters
                        .slice(-1)
                        .toLowerCase();
                    const clueWord = await prompt(
                        ` Clue word (starts with '${lastLetter}'): `
                    );
                    const clueDef = await prompt(
                        ` Definition for "${clueWord}": `
                    );
                    clueAccepted = await this.startNewClueRound(
                        clueGiverId,
                        clueWord,
                        clueDef
                    );
                    if (!clueAccepted) clueGiverId = null;
                }

                let guessAccepted = false;
                while (!guessAccepted) {
                    const eligibleGuessers = Object.keys(this.players).filter(
                        (id) => id !== clueGiverId
                    );
                    const guesserId = await prompt(
                        ` Who guesses first? (${eligibleGuessers.join("/")}) : `
                    );
                    const lastLetter = this.currentSession.revealedLetters
                        .slice(-1)
                        .toLowerCase();
                    const guess = await prompt(
                        ` What does ${guesserId} guess? (starts with '${lastLetter}'): `
                    );

                    const result = await this.submitGuess(guesserId, guess);
                    guessAccepted = result.correct;

                    if (result.correct && !result.revealed) {
                        Logger.logCorrectGuessNoReveal(
                            this.roomId,
                            usernames[guesserId]
                        );
                    }
                }

                if (
                    this.currentSession.keeperWord &&
                    this.currentSession.revealedLetters.length ===
                        this.currentSession.keeperWord.length
                ) {
                    roundOver = true;
                    const nextKeeper = this.getNextKeeper();
                    this.keeperUsername = nextKeeper;
                    this.players[nextKeeper].setRole("keeper");

                    Object.keys(this.players).forEach((id) => {
                        if (id !== nextKeeper)
                            this.players[id].setRole("seeker");
                    });

                    this.pastKeepers.add(nextKeeper);
                    this.currentSession = new GameSession();
                }
            }
        }

        this.endGame();

        for (const username in this.players) {
            Logger.logFinalScore(username, this.players[username].gameScore);
        }

        Logger.logManualTestComplete();
    }

    startNewClueRound(clueGiverId, clueWord, clueDefinition) {
        if (!this.currentSession.keeperWord) {
            Logger.logCannotClueWithoutKeeperWord(this.roomId);
            return false;
        }

        if (clueGiverId === this.keeperUsername) {
            Logger.logClueNotAllowed(this.roomId);
            return false;
        }

        const lastLetter = this.currentSession.revealedLetters
            .slice(-1)
            .toLowerCase();
        if (!clueWord.toLowerCase().startsWith(lastLetter)) {
            Logger.logInvalidClue(this.roomId, clueWord, lastLetter);
            return false;
        }

        if (this.usedWords.has(clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return false;
        }

        this.usedWords.add(clueWord.toLowerCase());

        this.currentSession.setClue(clueGiverId, clueWord, clueDefinition);
        Logger.logClueSet(this.roomId, clueGiverId, clueDefinition);

        this.raceTimer = setTimeout(() => {
            this.handleClueTimeout();
        }, MAX_RACE_TIME);

        return true;
    }

    async submitGuess(userId, guessWord) {
        const session = this.currentSession;
        const revealed = session.revealedLetters;
        const lastLetter = revealed[revealed.length - 1].toLowerCase();
        const guessFirstLetter = guessWord[0].toLowerCase();
        const valid = await isValidEnglishWord(guessWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, guessWord);
            return { correct: false };
        }

        if (guessFirstLetter !== lastLetter) {
            Logger.logInvalidGuess(this.roomId, guessWord, lastLetter);
            return { correct: false };
        }

        if (
            session.guesses.find(
                (g) => g.word.toLowerCase() === guessWord.toLowerCase()
            )
        ) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            return { correct: false };
        }

        session.addGuess(userId, guessWord);
        this.usedWords.add(guessWord.toLowerCase());

        if (guessWord.toLowerCase() === session.clueTargetWord?.toLowerCase()) {
            const timeElapsed = (new Date() - session.raceStartTime) / 1000;

            const isKeeper = userId === this.keeperUsername;
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

        let pointsEarned = Math.ceil(BASE_POINTS - timeElapsed * PENALTY_RATE);
        if (pointsEarned < 1) pointsEarned = 1;

        this.players[guesserId].addScore(pointsEarned);
        this.players[clueGiverId].addScore(pointsEarned);

        const isWordFullyRevealed = session.revealNextLetter();

        Logger.logGuessCorrect(this.roomId, guesserId, pointsEarned);
        Logger.logRevealedLetters(this.roomId, session.revealedLetters);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = "waiting";

        if (isWordFullyRevealed) {
            const currentKeeper = this.keeperUsername;
            this.pastKeepers.add(currentKeeper);

            const nextKeeper = this.getNextKeeper();
            this.keeperUsername = nextKeeper;
            this.players[nextKeeper].setRole("keeper");

            Object.keys(this.players).forEach((id) => {
                if (id !== nextKeeper) this.players[id].setRole("seeker");
            });

            this.currentSession = new GameSession();
            Logger.logNextKeeper(this.roomId, nextKeeper);

            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    handleKeeperClueGuess(keeperUsername) {
        const session = this.currentSession;
        Logger.logKeeperGuessedClue(this.roomId, keeperUsername);
        this.players[keeperUsername].addScore(2);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = "waiting";
    }

    handleKeeperWordGuess(userId, guessWord) {
        Logger.logKeeperWordGuessAttempt(this.roomId, userId);

        if (this.currentSession.status === "ended") return;

        if (
            this.currentSession.keeperWord.toLowerCase() ===
            guessWord.toLowerCase()
        ) {
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
        session.status = "waiting";
    }

    getNextKeeper() {
        const currentIndex = this.turnQueue.indexOf(this.keeperUsername);
        const nextIndex = (currentIndex + 1) % this.turnQueue.length;
        return this.turnQueue[nextIndex];
    }

    isGameOver() {
        return this.pastKeepers.size >= Object.keys(this.players).length;
    }

    endGame() {
        this.status = "ended";

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

        Logger.logGameOver(
            this.roomId,
            winners.map((p) => p.username)
        );
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
