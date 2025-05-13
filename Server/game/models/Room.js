const Player = require("./Player");
const GameRound = require("./GameRound");
const { ROLES } = require("../constants");
const isValidEnglishWord = require("../../utils/validateWord");
const Logger = require("../Logger");

const MAX_RACE_TIME = 10000;
const BASE_POINTS = 15;
const PENALTY_RATE = 2;
const CLUE_FAIL_PENALTY = 5;
const CLUE_BONUS = 5;

// work with socket version:
class Room {
    constructor(roomId, keeperUsername, seekersUsernames) {
        this.roomId = roomId;
        this.status = "PRE-ROUND"; //options: "PRE-ROUND","MID-ROUND","END";
        this.keeperUsername = keeperUsername;
        this.players = [];
        this.currentRound = new GameRound();
        this.roundsHistory = [];
        this.turnQueue = seekersUsernames.slice();
        this.usedWords = new Set();

        const keeper = new Player(keeperUsername);
        keeper.setRole(ROLES.KEEPER);
        this.players.push(keeper);

        seekersUsernames.forEach((username) => {
            const seeker = new Player(username);
            seeker.setRole(ROLES.SEEKER);
            this.players.push(seeker);
        });

        this.pastKeepers = new Set();
        this.pastKeepers.add(keeperUsername);

        this.isWordFullyRevealed = false;
    }

    getKeeperWord() {
        return this.currentRound.keeperWord;
    }

    /**
     * Get the part of the word that is currently revealed to all players in room
     * @returns {string}
     */
    getRevealedLetters() {
        return this.currentRound.revealedLetters;
    }

    /**
     * returns player object by username
     * @param {string} username
     * @returns {Player}
     */
    getPlayerByUsername(username) {
        return this.players.find((player) => player.username === username);
    }

    updateStatus(status) {
        this.status = status;
    }

    async waitForKeeperWord(getWordFromSocket) {
        while (!this.currentRound.keeperWord) {
            const word = await getWordFromSocket(this.keeperUsername);
            await this.setKeeperWordWithValidation(word);
        }
    }

    async runGame(prompt) {
        while (!this.isGameOver()) {
            Logger.logCurrentKeeper(this.roomId, this.keeperUsername);

            while (!this.currentRound.keeperWord) {
                const word = await prompt(`🔑 ${this.keeperUsername}, enter your secret word: `);
                await this.waitForKeeperWord(getWordFromSocket);
            }

            let roundOver = false;

            while (!roundOver) {
                if (!this.currentRound.keeperWord) break;

                let clueAccepted = false;
                let clueGiverId = null;
                while (!clueAccepted) {
                    const seekers = this.players.filter((player) => player.role === ROLES.SEEKER);
                    clueGiverId = await prompt(` Who gives the clue? (${seekers.join("/")}) : `);
                    const lastLetter = this.currentRound.revealedLetters.slice(-1).toLowerCase();
                    const clueWord = await prompt(` Clue word (starts with '${lastLetter}'): `);
                    const clueDef = await prompt(` Definition for "${clueWord}": `);
                    clueAccepted = await this.startNewClueRound(clueGiverId, clueWord, clueDef);
                    if (!clueAccepted) clueGiverId = null;
                }

                let guessAccepted = false;
                while (!guessAccepted) {
                    const eligibleGuessers = this.players.filter((player) => player.username !== clueGiverId);
                    const guesserId = await prompt(` Who guesses first? (${eligibleGuessers.join("/")}) : `);
                    const lastLetter = this.currentRound.revealedLetters.slice(-1).toLowerCase();
                    const guess = await prompt(` What does ${guesserId} guess? (starts with '${lastLetter}'): `);

                    const result = await this.submitGuess(guesserId, guess);
                    guessAccepted = result.correct;

                    if (result.correct && !result.revealed) {
                        Logger.logCorrectGuessNoReveal(this.roomId, usernames[guesserId]);
                    }
                }

                if (this.currentRound.keeperWord && this.currentRound.revealedLetters.length === this.currentRound.keeperWord.length) {
                    roundOver = true;
                    const nextKeeperUsername = this.getNextKeeper();
                    this.keeperUsername = nextKeeperUsername;
                    this.players.find((player) => player.username === nextKeeperUsername).setRole(ROLES.KEEPER);

                    this.players.forEach((player) => {
                        if (player.username !== nextKeeperUsername) player.setRole(ROLES.SEEKER);
                    });

                    this.pastKeepers.add(nextKeeperUsername);
                    this.currentRound = new GameRound();
                }
            }
        }

        this.endGame();

        this.players.forEach((player) => {
            Logger.logFinalScore(player.username, player.gameScore);
        });

        Logger.logManualTestComplete();
    }

    startNewClueRound(clueGiverId, clueWord, clueDefinition) {
        if (!this.currentRound.keeperWord) {
            Logger.logCannotClueWithoutKeeperWord(this.roomId);
            return false;
        }

        if (clueGiverId === this.keeperUsername) {
            Logger.logClueNotAllowed(this.roomId);
            return false;
        }

        const revealedPrefix = this.currentRound.revealedLetters.toLowerCase();
        if (!clueWord.toLowerCase().startsWith(revealedPrefix)) {
            Logger.logInvalidClue(this.roomId, clueWord, revealedPrefix);
            return false;
        }

        if (this.usedWords.has(clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return false;
        }

        this.usedWords.add(clueWord.toLowerCase());

        this.currentRound.addClue(clueGiverId, clueWord, clueDefinition);
        Logger.logClueSet(this.roomId, clueGiverId, clueDefinition);

        this.raceTimer = setTimeout(() => {
            this.handleClueTimeout();
        }, MAX_RACE_TIME);

        return true;
    }

    async submitGuess(userId, guessWord, clueId) {
        const session = this.currentRound;
        const revealed = session.revealedLetters;
        const revealedPrefix = revealed.toLowerCase();
        const guessLower = guessWord.toLowerCase();

        const valid = await isValidEnglishWord(guessWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, guessWord);
            return { correct: false };
        }

        if (!guessLower.startsWith(revealedPrefix)) {
            Logger.logInvalidGuess(this.roomId, guessWord, revealedPrefix);
            return { correct: false };
        }

        if (session.guesses.find((g) => g.word.toLowerCase() === guessLower)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            return { correct: false };
        }

        session.addGuess(userId, guessWord);
        this.usedWords.add(guessLower);

        // 🧠 Look up the clue by clueId
        const matchedClue = session.clues.find((clue) => clue.id === clueId && !clue.blocked);

        if (matchedClue && matchedClue.word === guessLower) {
            const timeElapsed = (new Date() - session.raceStartTime) / 1000;

            if (userId === this.keeperUsername) {
                this.handleKeeperClueGuess(userId); // optional for keeper guess matching
                clearTimeout(this.raceTimer);
                return { correct: true, revealed: false };
            } else {
                this.handleCorrectGuess(userId, timeElapsed, clueId);
                clearTimeout(this.raceTimer);
                return { correct: true, revealed: true, isWordComplete: this.isWordFullyRevealed };
            }
        }

        // Optional: still allow full keeper word guess
        if (guessLower === session.keeperWord?.toLowerCase()) {
            this.handleKeeperWordGuess(userId, guessWord);
            return { correct: true, revealed: false };
        }

        return { correct: false };
    }

    handleCorrectGuess(guesserId, timeElapsed, clueId) {
        const session = this.currentRound;

        // 🧠 Find the correct clue
        const matchedClue = session.clues.find((c) => c.id === clueId);
        if (!matchedClue) {
            Logger.logError(this.roomId, "No clue found for clueId: " + clueId);
            return;
        }

        const clueGiverId = matchedClue.from;

        let pointsEarned = Math.ceil(BASE_POINTS - timeElapsed * PENALTY_RATE);
        if (pointsEarned < 1) pointsEarned = 1;

        this.players.find((player) => player.username === guesserId).addScore(pointsEarned);
        this.players.find((player) => player.username === clueGiverId).addScore(pointsEarned);

        // 🧼 Mark the clue as blocked so no one else can use it
        matchedClue.blocked = true;

        this.isWordFullyRevealed = session.revealNextLetter();
        session.resetCluesHistory();

        Logger.logGuessCorrect(this.roomId, guesserId, pointsEarned);
        Logger.logRevealedLetters(this.roomId, session.revealedLetters);

        session.status = "waiting";

        if (this.isWordFullyRevealed) {
            const currentKeeper = this.keeperUsername;
            this.pastKeepers.add(currentKeeper);

            const nextKeeper = this.getNextKeeper();
            this.keeperUsername = nextKeeper;
            this.players.find((player) => player.username === nextKeeper).setRole(ROLES.KEEPER);

            this.players.forEach((player) => {
                if (player.username !== nextKeeper) player.setRole(ROLES.SEEKER);
            });

            this.roundsHistory.push({
                roundNumber: this.currentRound.roundNum,
                keeperWord: this.currentRound.keeperWord,
                revealedLetters: this.currentRound.revealedLetters,
                clueWord: matchedClue.word,
                clueGiver: matchedClue.from,
                guessesCount: this.currentRound.guesses.length,
            });

            this.currentRound = new GameRound();
            this.currentRound.roundNum = this.roundsHistory.length + 1;
            this.status = "PRE-ROUND";
            Logger.logNextKeeper(this.roomId, nextKeeper);

            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    handleKeeperClueGuess(keeperUsername) {
        const session = this.currentRound;
        Logger.logKeeperGuessedClue(this.roomId, keeperUsername);
        this.players.find((player) => player.username === keeperUsername).addScore(2);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = "waiting";
    }

    handleKeeperWordGuess(userId, guessWord) {
        Logger.logKeeperWordGuessAttempt(this.roomId, userId);

        if (this.currentRound.status === "ended") return;

        if (this.currentRound.keeperWord.toLowerCase() === guessWord.toLowerCase()) {
            this.players.find((player) => player.username === userId).addScore(50);
            this.currentRound.endSession();
        } else {
            this.players.find((player) => player.username === userId).addScore(-20);
        }
    }

    handleClueTimeout() {
        const session = this.currentRound;

        Logger.logTimeUp(this.roomId);

        const penalized = new Set();

        for (const clue of session.clues) {
            if (!clue.blocked && !penalized.has(clue.from)) {
                const player = this.players.find((player) => player.username === clue.from);
                if (player) {
                    player.addScore(-CLUE_FAIL_PENALTY);
                    penalized.add(clue.from);
                }
            }
        }

        // Reset session clue state
        session.status = "waiting";
    }

    getNextKeeper() {
        const currentIndex = this.turnQueue.indexOf(this.keeperUsername);
        const nextIndex = (currentIndex + 1) % this.turnQueue.length;
        return this.turnQueue[nextIndex];
    }

    isGameOver() {
        return this.pastKeepers.size >= this.players.length;
    }

    async endGame() {
        this.status = "ended";

        let maxScore = -Infinity;

        // can be multiple winners
        let winners = [];

        for (const player of this.players) {
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

        // map on usernames of the winners
        const winnerUsernames = new Set(winners.map((p) => p.username));

        // update the mongo
        for (const player of this.players) {
            try {
                const isWinner = winnerUsernames.has(player.username);
                const increment = {
                    "statistics.totalGames": 1,
                    [`statistics.${isWinner ? "Wins" : "Losses"}`]: 1,
                };

                const user = await User.findOneAndUpdate({ username: player.username }, { $inc: increment }, { new: true });

                if (user) {
                    const { Wins, totalGames } = user.statistics;
                    const newWinRate = ((Wins / totalGames) * 100).toFixed(2);
                    await User.updateOne({ username: player.username }, { $set: { "statistics.winRate": newWinRate } });
                }
            } catch (err) {
                console.error(`Failed to update stats for ${player.username}:`, err);
            }
        }
    }

    async setKeeperWordWithValidation(word) {
        const valid = await isValidEnglishWord(word);
        if (!valid) {
            Logger.logInvalidKeeperWord(this.roomId, word);
            return false;
        }

        this.currentRound.setKeeperWord(word);
        Logger.logKeeperWordSet(this.roomId, word);
        return true;
    }
}

module.exports = Room;
