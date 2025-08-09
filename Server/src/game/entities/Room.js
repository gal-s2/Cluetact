const Player = require("./Player");
const GameRound = require("./GameRound");
const { isValidEnglishWord } = require("../../utils/wordUtils");
const Logger = require("../Logger");
const User = require("../../models/User");
const CountdownTimer = require("../entities/CountdownTimer");

// Constants
const ROLES = require("../constants/roles");
const POINTS = require("../constants/points");
const GAME_STAGES = require("../constants/gameStages");
const TIMES = require("../constants/times");
const Guess = require("./Guess");
const Clue = require("./Clue");

/**
 * Game Room Class
 */
class Room {
    // Private properties:
    #roomId;

    constructor(roomId, keeper, seekers, callbacks = {}) {
        this.#roomId = roomId;
        this.status = GAME_STAGES.PRE_ROUND;
        this.callbacks = callbacks;

        // Players
        this.keeper = null;
        this.seekers = [];
        this.players = [];
        this.keeperUsername = keeper.username; // remove in the future, should use keeper.username
        this.setPlayersData(keeper, seekers);
        this.seekersUsernames = this.players.filter((player) => player.role === ROLES.SEEKER).map((player) => player.username);

        this.currentRound = new GameRound();
        this.roundsHistory = [];
        this.turnQueue = seekers.map((user) => user.username).slice();
        this.indexOfSeekerOfCurrentTurn = 0;
        this.wordsGuessedSuccesfully = new Set();
        this.winners = [];
        this.pastKeepers = new Set();
        this.pastKeepers.add(this.keeperUsername);
        this.isWordFullyRevealed = false;
        this.keepersWordsHistory = new Set();

        this.raceTimer = null;
        this.keeperChoosingWordTimer = null;
        this.clueSubmissionTimer = null;

        this.setStatus(GAME_STAGES.KEEPER_CHOOSING_WORD);
    }

    destroy() {
        this.keeperChoosingWordTimer?.stop();
        this.clueSubmissionTimer?.stop();
        this.raceTimer?.stop();
        this.callbacks = null;
    }

    get roomId() {
        return this.#roomId;
    }

    get keeperChoosingWordTime() {
        return this.keeperChoosingWordTimer?.getTimeLeft();
    }

    setStatus(newStatus) {
        if (!newStatus) return;

        console.log(`changing to ${newStatus} status`);

        switch (newStatus) {
            case GAME_STAGES.KEEPER_CHOOSING_WORD:
                this.keeperChoosingWordTimer = new CountdownTimer(TIMES.KEEPER_CHOOSING_WORD, this.onKeeperWordTimeout.bind(this));
                this.keeperChoosingWordTimer.start();
                break;

            case GAME_STAGES.CLUE_SUBMISSION:
                this.clueSubmissionTimer = new CountdownTimer(TIMES.CLUE_SUBMISSION, this.onClueSubmissionTimeout.bind(this));
                this.clueSubmissionTimer.start();
                break;

            case GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT:
                this.clueSubmissionTimer = new CountdownTimer(TIMES.CLUE_SUBMISSION_POST_CLUETACT, this.onClueSubmissionTimeout.bind(this));
                this.clueSubmissionTimer.start();
                break;

            case GAME_STAGES.END:
                break;

            default:
                return;
        }

        this.status = newStatus;
    }

    onKeeperWordTimeout() {
        this.setNextRound();
        this.callbacks?.onKeeperWordTimeout?.(this);
    }

    setPlayersData(keeper, seekers) {
        this.players = [];
        const keeperPlayer = new Player(keeper.username, keeper.avatar);
        keeperPlayer.setRole(ROLES.KEEPER);
        this.players.push(keeperPlayer);
        this.keeper = keeperPlayer;

        seekers.forEach((seeker) => {
            const seekerPlayer = new Player(seeker.username, seeker.avatar);
            this.seekers.push(seekerPlayer);
            seekerPlayer.setRole(ROLES.SEEKER);
            this.players.push(seekerPlayer);
        });
    }

    /**
     * Removing player from room by username
     * @param {string} username
     */
    removePlayerByUsername(username) {
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

    getTimeLeft() {
        return this.raceTimer ? this.raceTimer.getTimeLeft() : 0;
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

    revealNextLetter() {
        const currentLength = this.currentRound.revealedLetters.length;
        if (this.currentRound.keeperWord && currentLength < this.currentRound.keeperWord.length) {
            this.currentRound.revealedLetters += this.currentRound.keeperWord[currentLength];
            this.currentRound.countOfClueSubmittersInPrefix = 0;
            // Return true if this was the last letter
            return this.currentRound.revealedLetters.length === this.currentRound.keeperWord.length;
        }

        return false; // Already fully revealed
    }

    updateStatus(status) {
        this.status = status;
    }

    tryBlockClue(wordGuess, keeperUsername) {
        const result = this.validateClueBlocking(wordGuess, keeperUsername);

        if (result.success) {
            this.wordsGuessedSuccesfully.add(wordGuess.toLowerCase());
            this.advanceToNextSeeker();
            this.addPointsToPlayerByUsername(keeperUsername, POINTS.KEEPER_BLOCK_BONUS);
            this.setStatus(GAME_STAGES.CLUE_SUBMISSION);
        }
        return result;
    }

    validateClueBlocking(wordGuess, keeperUsername) {
        const lowerGuess = wordGuess.toLowerCase();
        const activeClue = this.currentRound.getActiveClue();

        if (!activeClue.blocked && activeClue.word === lowerGuess) {
            this.raceTimer?.stop();
            activeClue.blocked = true;
            activeClue.active = false;
            this.currentRound.guesses = [];
            return {
                success: true,
                blockedClue: activeClue,
            };
        } else this.currentRound.guesses.push(new Guess(keeperUsername, lowerGuess));

        return { success: false };
    }

    async startNewClueRound(clueGiverUsername, clueWord, clueDefinition, onRaceTimeout) {
        const valid = await isValidEnglishWord(clueWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, clueWord);
            return [false, "Invalid guess, please guess valid English word"];
        }

        if (!this.currentRound.keeperWord) {
            Logger.logCannotClueWithoutKeeperWord(this.roomId);
            return [false, "Early guess"];
        }

        if (clueGiverUsername === this.keeperUsername) {
            Logger.logClueNotAllowed(this.roomId);
            return [false, "Keeper not allowed to play"];
        }

        const revealedPrefix = this.currentRound.revealedLetters.toLowerCase();
        if (!clueWord.toLowerCase().startsWith(revealedPrefix)) {
            Logger.logInvalidClue(this.roomId, clueWord, revealedPrefix);
            return [false, `Word should start with ${revealedPrefix}`];
        }

        if (this.currentRound.clues.find((clue) => clue.word.toLowerCase() === clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return [false, "Invalid guess, this clue has already been given"];
        }
        if (clueDefinition.toLowerCase().includes(clueWord.toLowerCase())) {
            return [false, "Invalid guess, definition containing the word cannot be used."];
        }

        this.clueSubmissionTimer?.stop();
        this.currentRound.countOfClueSubmittersInPrefix++;
        const clue = new Clue(clueGiverUsername, clueWord, clueDefinition);
        this.currentRound.clues.push(clue);
        Logger.logClueSet(this.roomId, clueGiverUsername, clueDefinition);

        this.raceTimer = new CountdownTimer(TIMES.TURN_INTERVAL, onRaceTimeout);
        this.raceTimer.start();

        return [true];
    }

    handleRaceTimeout() {
        const result = { isAdvancingToNextLetter: false };
        const clue = this.currentRound.getActiveClue();

        // Block the clue without assigning points
        clue.blocked = true;
        clue.active = false;

        // Advance to next seeker
        this.advanceToNextSeeker();

        if (this.currentRound.countOfClueSubmittersInPrefix === this.seekersUsernames.length) {
            result.isAdvancingToNextLetter = true;
            this.isWordFullyRevealed = this.revealNextLetter();
        }

        // Reset clue history and guesses
        this.currentRound.resetCluesHistory();
        this.currentRound.resetGuessesHistory();

        this.setStatus(GAME_STAGES.CLUE_SUBMISSION);

        return result;
    }

    onClueSubmissionTimeout() {
        this.advanceToNextSeeker();
        this.setStatus(GAME_STAGES.CLUE_SUBMISSION);
        this.callbacks?.onClueSubmissionTimeout?.(this);
    }

    async submitGuess(guesserUsername, guessWord, clueId) {
        const revealed = this.currentRound.revealedLetters;
        const revealedPrefix = revealed.toLowerCase();
        const guessLower = guessWord.toLowerCase();
        const result = { correct: false, isGameEnded: false, message: "" };

        if (!guessLower.startsWith(revealedPrefix)) {
            Logger.logInvalidGuess(this.roomId, guessWord, revealedPrefix);
            result.message = "Guess should start with " + revealedPrefix;
            return result;
        }

        if (this.currentRound.guesses.find((g) => g.word.toLowerCase() === guessLower)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            result.message = "Guess has already been submitted";
            return result;
        }
        const valid = await isValidEnglishWord(guessWord);

        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, guessWord);
            result.message = "Invalid English word, please try again";
            return result;
        }

        this.currentRound.guesses.push(new Guess(guesserUsername, guessWord.toLowerCase()));

        // 🧠 Look up the clue by clueId
        const clue = this.currentRound.getActiveClue();

        if (clue && clue.word === guessLower) {
            clue.active = false;
            result.correct = true;
            this.currentRound.resetGuessesHistory();
            let pointsToGive = POINTS.CLUE_BONUS;

            this.wordsGuessedSuccesfully.add(guessLower);
            this.handleCorrectGuessBySeeker(guesserUsername, clueId);
            result.revealed = true;
            result.isWordComplete = this.isWordFullyRevealed;

            if (guessLower === this.currentRound.keeperWord?.toLowerCase() || this.isWordFullyRevealed) {
                result.isWordComplete = true;
                result.keeperWord = this.currentRound.keeperWord;
                this.setNextRound();
                pointsToGive += POINTS.PERFECT_GUESS_BONUS;
            }

            this.addPointsToPlayerByUsername(guesserUsername, pointsToGive);
            this.addPointsToPlayerByUsername(clue.from, pointsToGive);
            result.isGameEnded = this.isGameOver();

            this.raceTimer?.stop();
            if (result.isGameEnded) this.setStatus(GAME_STAGES.END);
            else this.setStatus(GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT);
        }

        return result;
    }

    handleCorrectGuessBySeeker(guesserUsername, clueId) {
        const clue = this.currentRound.getActiveClue();
        if (!clue) {
            Logger.logError(this.roomId, "No active clue found for correct guess");
            return;
        }

        const clueGiverusername = clue.from;

        clue.blocked = true;
        this.advanceToNextSeeker();
        this.isWordFullyRevealed = this.revealNextLetter();
        this.currentRound.resetCluesHistory();
    }

    /**
     * Setting next round / end game if completed.
     * New keeper and seekers update, changing status
     */
    setNextRound() {
        const currentKeeper = this.keeperUsername;
        this.pastKeepers.add(currentKeeper);
        this.seekersUsernames.push(currentKeeper);
        const nextKeeper = this.getNextKeeper();
        this.seekersUsernames = this.seekersUsernames.filter((seekerUsername) => seekerUsername !== nextKeeper);
        this.keeperUsername = nextKeeper;

        this.players.find((player) => player.username === nextKeeper).setRole(ROLES.KEEPER);

        this.players.forEach((player) => {
            if (player.username !== nextKeeper) player.setRole(ROLES.SEEKER);
        });

        this.roundsHistory.push(this.currentRound);

        if (this.isGameOver()) {
            this.endGame();
        } else {
            this.currentRound = new GameRound();
            this.currentRound.roundNum = this.roundsHistory.length + 1;
            this.setStatus(GAME_STAGES.KEEPER_CHOOSING_WORD);
            Logger.logNextKeeper(this.roomId, nextKeeper);
        }
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

    addPointsToPlayerByUsername(username, points) {
        this.players.find((player) => player.username === username).addScore(points);
    }

    async endGame() {
        this.setStatus(GAME_STAGES.END);

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

    /**
     * Checking if given word is valid and if it is, setting it as keeper word
     * @param {string} word
     * @returns {Array} [is word valid, reason for when word is not valid]
     */
    async setKeeperWordWithValidation(word) {
        if (this.keepersWordsHistory.has(word)) {
            return [false, "Previous keeper has already chose this word, Please enter another word"];
        }

        const valid = await isValidEnglishWord(word);
        if (!valid) {
            Logger.logInvalidKeeperWord(this.roomId, word);
            return [false, "Invalid English word, please try again"];
        }

        this.currentRound.setKeeperWord(word);
        this.keeperChoosingWordTimer?.stop();

        Logger.logKeeperWordSet(this.roomId, word);
        return [true];
    }
}

module.exports = Room;
