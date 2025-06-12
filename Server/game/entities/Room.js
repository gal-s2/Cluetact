const Player = require("./Player");
const GameRound = require("./GameRound");
const { ROLES } = require("../constants");
const isValidEnglishWord = require("../../utils/validateWord");
const Logger = require("../Logger");
const User = require("../../models/User");

const MAX_RACE_TIME = 10000;
const BASE_POINTS = 15;
const PENALTY_RATE = 2;
const CLUE_FAIL_PENALTY = 5;
const CLUE_BONUS = 5;

class Room {
    constructor(roomId, keeper, seekers) {
        this.roomId = roomId;
        this.status = "PRE-ROUND"; //options: "PRE-ROUND","MID-ROUND","END";
        this.keeperUsername = keeper.username;
        this.setPlayersData(keeper, seekers);
        this.currentRound = new GameRound(this.players);
        this.roundsHistory = [];
        this.turnQueue = seekers.map((user) => user.username).slice();
        this.seekersUsernames = this.playersArrayToUsernamesOfSeekers(this.players);
        this.indexOfSeekerOfCurrentTurn = 0;
        this.wordsGuessedSuccesfully = new Set();
        this.winners = [];
        this.pastKeepers = new Set();
        this.pastKeepers.add(this.keeperUsername);
        this.isWordFullyRevealed = false;

        console.log(`Room ${roomId} created with the following players: `, this.players);
    }

    playersArrayToUsernamesOfSeekers(players) {
        return players.filter((player) => player.role === ROLES.SEEKER).map((player) => player.username);
    }

    setPlayersData(keeper, seekers) {
        this.players = [];
        const keeperPlayer = new Player(keeper.username, keeper.avatar);
        keeperPlayer.setRole(ROLES.KEEPER);
        this.players.push(keeperPlayer);

        seekers.forEach((seeker) => {
            const seekerPlayer = new Player(seeker.username, seeker.avatar);
            seekerPlayer.setRole(ROLES.SEEKER);
            this.players.push(seekerPlayer);
        });
    }

    removePlayer(username) {
        this.players = this.players.filter((player) => player.username !== username);
    }

    getWinners() {
        return this.winners;
    }

    getKeeperWord() {
        return this.currentRound.keeperWord;
    }

    getCurrentClueGiverUsername() {
        return this.seekersUsernames[this.indexOfSeekerOfCurrentTurn];
    }

    getGuesses() {
        return this.currentRound.guesses;
    }

    /**
     * Get the part of the word that is currently revealed to all players in room
     * @returns {string}
     */
    getRevealedLetters() {
        const revaledLettersCurrentRound = this.currentRound.revealedLetters;
        if (revaledLettersCurrentRound === "" && this.roundsHistory.length > 0) {
            return this.roundsHistory[this.roundsHistory.length - 1]?.revealedLetters || "";
        } else return revaledLettersCurrentRound;
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

    tryBlockClue(wordGuess, keeperUsername) {
        const result = this.currentRound.tryBlockClue(wordGuess, keeperUsername);
        if (result.success) {
            this.wordsGuessedSuccesfully.add(wordGuess.toLowerCase());
            this.advanceToNextSeeker();
        }
        return result;
    }

    async waitForKeeperWord(getWordFromSocket) {
        while (!this.currentRound.keeperWord) {
            const word = await getWordFromSocket(this.keeperUsername);
            await this.setKeeperWordWithValidation(word);
        }
    }

    async startNewClueRound(clueGiverUsername, clueWord, clueDefinition) {
        const valid = await isValidEnglishWord(clueWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, clueWord);
            return false;
        }
        if (!this.currentRound.keeperWord) {
            Logger.logCannotClueWithoutKeeperWord(this.roomId);
            return false;
        }

        if (clueGiverUsername === this.keeperUsername) {
            Logger.logClueNotAllowed(this.roomId);
            return false;
        }

        const revealedPrefix = this.currentRound.revealedLetters.toLowerCase();
        if (!clueWord.toLowerCase().startsWith(revealedPrefix)) {
            Logger.logInvalidClue(this.roomId, clueWord, revealedPrefix);
            return false;
        }

        if (this.wordsGuessedSuccesfully.has(clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return false;
        }

        this.currentRound.addClue(clueGiverUsername, clueWord, clueDefinition);
        Logger.logClueSet(this.roomId, clueGiverUsername, clueDefinition);

        return true;
    }

    async submitGuess(username, guessWord, clueId) {
        const session = this.currentRound;
        const revealed = session.revealedLetters;
        const revealedPrefix = revealed.toLowerCase();
        const guessLower = guessWord.toLowerCase();
        const result = { correct: false, isGameEnded: false };

        const valid = await isValidEnglishWord(guessWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, guessWord);
            return result;
        }

        if (!guessLower.startsWith(revealedPrefix)) {
            Logger.logInvalidGuess(this.roomId, guessWord, revealedPrefix);
            return result;
        }

        if (session.guesses.find((g) => g.word.toLowerCase() === guessLower)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            return result;
        }

        session.addGuess(username, guessWord);

        // 🧠 Look up the clue by clueId
        const clue = session.getActiveClue();
        console.log("clue:", clue);
        if (clue && clue.word === guessLower) {
            clue.active = false;
            result.correct = true;
            this.currentRound.guesses = [];
            if (username === this.keeperUsername) {
                this.handleCorrectBlockByKeeper(username); // optional for keeper guess matching
                result.revealed = false;
            } else {
                this.wordsGuessedSuccesfully.add(guessLower);
                this.handleCorrectGuessBySeeker(username, clueId);
                result.revealed = true;
                result.isWordComplete = this.isWordFullyRevealed;
            }
            result.isGameEnded = this.isGameOver();
            return result;
        }

        // Optional: still allow full keeper word guess
        if (guessLower === session.keeperWord?.toLowerCase()) {
            this.handleKeeperWordGuessDuringCluetact(username, guessWord);
            result.correct = true;
            result.revealed = false;
        }

        return result;
    }

    handleCorrectGuessBySeeker(guesserUsername, clueId) {
        const session = this.currentRound;

        const clue = session.getActiveClue();
        if (!clue) {
            Logger.logError(this.roomId, "No active clue found for correct guess");
            return;
        }

        const clueGiverusername = clue.from;

        let pointsEarned = CLUE_BONUS;

        console.log("Cluetact achieved between ", clueGiverusername, " and ", guesserUsername);
        console.log("players list: ", this.players);
        this.players.find((player) => player.username === guesserUsername).addScore(pointsEarned);
        this.players.find((player) => player.username === clueGiverusername).addScore(pointsEarned);
        console.log("updated players:", this.players);
        // 🧼 Mark the clue as blocked so no one else can use it
        clue.blocked = true;
        console.log("previous seeker was: ", this.seekersUsernames[this.indexOfSeekerOfCurrentTurn]);
        this.advanceToNextSeeker();
        console.log("next seeker is: ", this.seekersUsernames[this.indexOfSeekerOfCurrentTurn]);
        this.isWordFullyRevealed = session.revealNextLetter();
        session.resetCluesHistory();

        Logger.logGuessCorrect(this.roomId, guesserUsername, pointsEarned);
        Logger.logRevealedLetters(this.roomId, session.revealedLetters);

        session.status = "waiting";

        if (this.isWordFullyRevealed) {
            const currentKeeper = this.keeperUsername;
            this.pastKeepers.add(currentKeeper);
            this.seekersUsernames.push(currentKeeper);
            const nextKeeper = this.getNextKeeper();
            this.seekersUsernames.filter((seekerUsername) => seekerUsername !== nextKeeper);
            this.keeperUsername = nextKeeper;
            this.players.find((player) => player.username === nextKeeper).setRole(ROLES.KEEPER);

            this.players.forEach((player) => {
                if (player.username !== nextKeeper) player.setRole(ROLES.SEEKER);
            });

            this.roundsHistory.push(this.currentRound);

            this.currentRound = new GameRound(this.players);
            this.currentRound.roundNum = this.roundsHistory.length + 1;
            this.status = "PRE-ROUND";
            Logger.logNextKeeper(this.roomId, nextKeeper);

            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }

    handleCorrectBlockByKeeper(keeperUsername) {
        const session = this.currentRound;
        Logger.logKeeperGuessedClue(this.roomId, keeperUsername);
        this.players.find((player) => player.username === keeperUsername).addScore(2);

        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = "waiting";
    }

    handleKeeperWordGuessDuringCluetact(userId, guessWord) {
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

    advanceToNextSeeker() {
        const nextIndex = (this.indexOfSeekerOfCurrentTurn + 1) % this.seekersUsernames.length;
        this.indexOfSeekerOfCurrentTurn = nextIndex;
        return this.seekersUsernames[nextIndex];
    }

    isGameOver() {
        return this.pastKeepers.size >= this.players.length;
    }

    async endGame() {
        this.status = "ended";

        let maxScore = -Infinity;

        for (const player of this.players) {
            if (player.gameScore > maxScore) {
                maxScore = player.gameScore;
                this.winners = [player.username];
            } else if (player.gameScore === maxScore) {
                this.winners.push(player.username);
            }
        }

        Logger.logGameOver(this.roomId, this.winners);

        // update the mongo
        for (const player of this.players) {
            try {
                const isWinner = this.winners.includes(player.username);
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
