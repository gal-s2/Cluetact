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
        this.keeperUsername = keeper.username; // TODO: in future use this.keeper.username directly
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

        // Timers
        this.raceTimer = null;
        this.keeperChoosingWordTimer = null;
        this.clueSubmissionTimer = null;

        this.setStatus(GAME_STAGES.KEEPER_CHOOSING_WORD);
    }

    destroy() {
        this.keeperChoosingWordTimer?.stop();
        this.clueSubmissionTimer?.stop();
        this.raceTimer?.stop();
        this.setWinners();
        this.setStatus(GAME_STAGES.END);
        this.callbacks = null;
    }

    get roomId() {
        return this.#roomId;
    }

    get keeperChoosingWordTime() {
        return this.keeperChoosingWordTimer?.getTimeLeft();
    }

    /**
     * Centralized status changes with timer hygiene:
     * - Stop timers that shouldn't survive the new status
     * - Never stack timers for the same phase
     */
    setStatus(newStatus) {
        if (!newStatus) return;

        // Stop timers that must not bleed into the next status
        if (newStatus !== GAME_STAGES.KEEPER_CHOOSING_WORD) {
            this.keeperChoosingWordTimer?.stop();
            this.keeperChoosingWordTimer = null;
        }
        if (newStatus !== GAME_STAGES.CLUE_SUBMISSION && newStatus !== GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT) {
            this.clueSubmissionTimer?.stop();
            this.clueSubmissionTimer = null;
        }
        if (newStatus !== this.status) {
            this.raceTimer?.stop();
            this.raceTimer = null;
        }

        console.log(`changing to ${newStatus} status`);

        switch (newStatus) {
            case GAME_STAGES.KEEPER_CHOOSING_WORD: {
                // Extra safety: ensure no previous keeper timer is running
                this.keeperChoosingWordTimer?.stop();
                this.keeperChoosingWordTimer = new CountdownTimer(TIMES.KEEPER_CHOOSING_WORD, this.onKeeperWordTimeout.bind(this));
                this.keeperChoosingWordTimer.start();
                break;
            }

            case GAME_STAGES.CLUE_SUBMISSION: {
                this.clueSubmissionTimer?.stop();
                this.clueSubmissionTimer = new CountdownTimer(TIMES.CLUE_SUBMISSION, this.onClueSubmissionTimeout.bind(this));
                this.clueSubmissionTimer.start();
                break;
            }

            case GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT: {
                this.clueSubmissionTimer?.stop();
                this.clueSubmissionTimer = new CountdownTimer(TIMES.CLUE_SUBMISSION_POST_CLUETACT, this.onClueSubmissionTimeout.bind(this));
                this.clueSubmissionTimer.start();
                break;
            }

            case GAME_STAGES.END: {
                // Hard stop everything at game end
                this.keeperChoosingWordTimer?.stop();
                this.clueSubmissionTimer?.stop();
                this.raceTimer?.stop();
                this.keeperChoosingWordTimer = this.clueSubmissionTimer = this.raceTimer = null;
                break;
            }

            default:
                break;
        }

        this.status = newStatus;
    }

    onKeeperWordTimeout() {
        // Ignore stale/double timers
        if (this.status !== GAME_STAGES.KEEPER_CHOOSING_WORD) return;

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
     * While a new keeper is choosing -> show nothing to avoid ghost letters from previous round
     * @returns {string}
     */
    getRevealedLetters() {
        if (this.status === GAME_STAGES.KEEPER_CHOOSING_WORD) return "";

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
        // If someone didn't submit in time, advance to next seeker and repeat
        this.advanceToNextSeeker();
        this.setStatus(GAME_STAGES.CLUE_SUBMISSION);
        this.callbacks?.onClueSubmissionTimeout?.(this);
    }

    /**
     * Main guess handler.
     * Fixes:
     *  - Direct secret word guesses end the round immediately (early return, no status override).
     *  - If a clue guess reveals the final letter, we setNextRound() and return early.
     *  - Avoid double timers / stale timeouts.
     */
    async submitGuess(guesserUsername, guessWord, clueId) {
        const revealed = this.currentRound.revealedLetters;
        const revealedPrefix = revealed.toLowerCase();
        const guessLower = guessWord.toLowerCase();
        const result = { correct: false, isGameEnded: false, message: "" };

        // Prefix guard
        if (!guessLower.startsWith(revealedPrefix)) {
            Logger.logInvalidGuess(this.roomId, guessWord, revealedPrefix);
            result.message = "Guess should start with " + revealedPrefix;
            return result;
        }

        // De-dup
        if (this.currentRound.guesses.find((g) => g.word.toLowerCase() === guessLower)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            result.message = "Guess has already been submitted";
            return result;
        }

        // Dictionary check
        const valid = await isValidEnglishWord(guessWord);
        if (!valid) {
            Logger.logInvalidSeekerWord(this.roomId, guessWord);
            result.message = "Invalid English word, please try again";
            return result;
        }

        this.currentRound.guesses.push(new Guess(guesserUsername, guessLower));

        const keeperWordLower = this.currentRound.keeperWord?.toLowerCase();

        // 1) Secret word guessed directly -> immediate round end
        if (keeperWordLower && guessLower === keeperWordLower) {
            this.raceTimer?.stop();
            this.clueSubmissionTimer?.stop();

            result.correct = true;
            result.isWordComplete = true;
            result.keeperWord = this.currentRound.keeperWord;

            // Award a lot of points to the guesser (+ optional assist to the active clue giver)
            const activeClue = this.currentRound.getActiveClue();
            this.addPointsToPlayerByUsername(guesserUsername, POINTS.PERFECT_GUESS_BONUS + POINTS.CLUE_BONUS);
            if (activeClue) {
                this.addPointsToPlayerByUsername(activeClue.from, POINTS.CLUE_BONUS);
                activeClue.active = false;
                activeClue.blocked = true;
            }

            // Clean histories
            this.currentRound.resetGuessesHistory();
            this.currentRound.resetCluesHistory();

            // Move to next round (or end)
            this.setNextRound();
            return result; // EARLY RETURN — do not override status or start timers
        }

        // 2) Normal case: guessed the active clue word
        const clue = this.currentRound.getActiveClue();

        if (clue && clue.word === guessLower) {
            clue.active = false;
            result.correct = true;

            // For the next race
            this.currentRound.resetGuessesHistory();

            // Base points for both players
            let pointsToGive = POINTS.CLUE_BONUS;
            this.wordsGuessedSuccesfully.add(guessLower);

            // Reveal next letter and advance turn
            this.handleCorrectGuessBySeeker(guesserUsername, clueId);

            result.revealed = true;
            result.isWordComplete = this.isWordFullyRevealed;

            if (result.isWordComplete) {
                // finished the word by revealing last letter
                result.keeperWord = this.currentRound.keeperWord;
                pointsToGive += POINTS.PERFECT_GUESS_BONUS;

                // score first, then promote round
                this.addPointsToPlayerByUsername(guesserUsername, pointsToGive);
                this.addPointsToPlayerByUsername(clue.from, pointsToGive);

                this.setNextRound();
                return result; // EARLY RETURN — do not override status
            }

            // Word not complete yet: keep playing within the same round
            this.addPointsToPlayerByUsername(guesserUsername, pointsToGive);
            this.addPointsToPlayerByUsername(clue.from, pointsToGive);

            this.raceTimer?.stop();
            result.isGameEnded = this.isGameOver();

            if (result.isGameEnded) {
                this.setStatus(GAME_STAGES.END);
                console.log("Status changed to END");
            } else this.setStatus(GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT);

            return result;
        }

        // Fallback for wrong-but-valid guess
        result.message = "Wrong guess, keep trying";
        return result;
    }

    handleCorrectGuessBySeeker(guesserUsername, clueId) {
        const clue = this.currentRound.getActiveClue();
        if (!clue) {
            Logger.logError(this.roomId, "No active clue found for correct guess");
            return;
        }

        // Advance flow
        clue.blocked = true;
        this.advanceToNextSeeker();
        this.isWordFullyRevealed = this.revealNextLetter();

        // Reset for the next race
        this.currentRound.resetCluesHistory();
    }

    /**
     * Setting next round / end game if completed.
     * New keeper and seekers update, changing status
     */
    setNextRound() {
        // Stop all timers from previous round to avoid stale/double fire
        this.keeperChoosingWordTimer?.stop();
        this.clueSubmissionTimer?.stop();
        this.raceTimer?.stop();
        this.keeperChoosingWordTimer = this.clueSubmissionTimer = this.raceTimer = null;

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

            // Start seeker cycle from the beginning each round
            this.indexOfSeekerOfCurrentTurn = 0;
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
        const p = this.players.find((player) => player.username === username);
        if (p) p.addScore(points);
    }

    setWinners() {
        let maxScore = -Infinity;

        for (const player of this.players) {
            if (player.gameScore > maxScore) {
                maxScore = player.gameScore;
                this.winners = [player.username];
            } else if (player.gameScore === maxScore) {
                this.winners.push(player.username);
            }
        }
    }

    async endGame() {
        console.log("Changing (end game) to End");
        this.setStatus(GAME_STAGES.END);
        this.setWinners();

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
