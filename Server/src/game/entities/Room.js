const Player = require("./Player");
const GameRound = require("./GameRound");
const { isValidEnglishWord, getWordsByPrefix } = require("../../utils/wordUtils");
const Logger = require("../Logger");
const User = require("../../models/User");
const CountdownTimer = require("../entities/CountdownTimer");
const RoomLock = require("../managers/RoomLock");

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
        this.players = [];
        this.setPlayersData(keeper, seekers);

        //Set round
        this.currentRound = new GameRound();
        this.roundsHistory = [];

        //Set initial roles
        this.currentClueGiverUsername;
        this.advanceToNextSeeker();

        this.wordsGuessedSuccesfully = new Set();
        this.winners = [];
        this.isWordFullyRevealed = false;
        this.keepersWordsHistory = new Set();

        //Timer
        this.timer = new CountdownTimer();

        //Room Lock
        this.roomLock = new RoomLock();

        //Go into the first status - letting the keeper choose a word
        this.setStatus(GAME_STAGES.KEEPER_CHOOSING_WORD);
    }

    //Call on room destruction
    destroy() {
        this.timer.stop();
        this.setWinners();
        this.setStatus(GAME_STAGES.END);
        this.callbacks = null;
    }

    get keeper() {
        return this.players.find((player) => player.role === ROLES.KEEPER) || null;
    }

    get keeperUsername() {
        return this.keeper?.username || null;
    }

    get seekersUsernames() {
        return this.players.filter((player) => player.role === ROLES.SEEKER).map((player) => player.username);
    }

    get seekersAsPlayers() {
        return this.players.filter((player) => player.role === ROLES.SEEKER);
    }

    get roomId() {
        return this.#roomId;
    }

    get isLastKeeper() {
        const playersThatWereNotKeepersAndAreNotCurrentKeeper = this.players.filter((player) => player.wasKeeper === false || player.role === ROLES.KEEPER);

        return playersThatWereNotKeepersAndAreNotCurrentKeeper.length === 1;
    }

    get pastKeepers() {
        return this.players.every((player) => player.wasKeeper === true);
    }

    get isActiveKeeper() {
        return this.players.find((player) => player.wasKeeper === false && player.role === ROLES.KEEPER);
    }

    get lock() {
        return this.roomLock;
    }

    getWinners() {
        return this.winners;
    }

    getKeeperWord() {
        return this.currentRound.keeperWord;
    }

    getCurrentClueGiverUsername() {
        return this.currentClueGiverUsername;
    }

    getGuesses() {
        return this.currentRound.guesses;
    }

    getTimeLeftUntilTimeout() {
        return this.timer ? this.timer.getTimeLeft() : 0;
    }

    getRevealedLetters() {
        if (this.status === GAME_STAGES.KEEPER_CHOOSING_WORD) return "";

        const revaledLettersCurrentRound = this.currentRound.revealedLetters;
        if (revaledLettersCurrentRound === "" && this.roundsHistory.length > 0) {
            return this.roundsHistory[this.roundsHistory.length - 1]?.revealedLetters || "";
        } else return revaledLettersCurrentRound;
    }

    getPlayerByUsername(username) {
        return this.players.find((player) => player.username === username);
    }

    isKeeperInRoom() {
        return this.players.some((player) => player.role === ROLES.KEEPER);
    }

    setPlayersData(keeper, seekers) {
        this.players = [];
        const keeperPlayer = new Player(keeper, keeper.avatar);
        keeperPlayer.setRole(ROLES.KEEPER);
        this.players.push(keeperPlayer);

        seekers.forEach((seeker) => {
            const seekerPlayer = new Player(seeker, seeker.avatar);
            seekerPlayer.setRole(ROLES.SEEKER);
            this.players.push(seekerPlayer);
        });
    }

    setStatus(newStatus, delayTimer = 0) {
        if (!newStatus) return;

        this.timer.stop();

        switch (newStatus) {
            case GAME_STAGES.KEEPER_CHOOSING_WORD: {
                // Extra safety: ensure no previous keeper timer is running
                this.timer.setNewTimerDetails(TIMES.KEEPER_CHOOSING_WORD + delayTimer, this.onKeeperWordTimeout.bind(this), GAME_STAGES.KEEPER_CHOOSING_WORD);
                this.roomLock.isKeeperWordLockAcquired = false;
                this.timer.start();
                break;
            }

            case GAME_STAGES.CLUE_SUBMISSION: {
                this.timer.setNewTimerDetails(TIMES.CLUE_SUBMISSION, this.onClueSubmissionTimeout.bind(this), GAME_STAGES.CLUE_SUBMISSION);
                this.roomLock.isSeekerTurnLockAcquired = false;
                this.timer.start();
                break;
            }

            case GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT: {
                this.timer.setNewTimerDetails(TIMES.CLUE_SUBMISSION_POST_CLUETACT, this.onClueSubmissionTimeout.bind(this), GAME_STAGES.CLUE_SUBMISSION_POST_CLUETACT);
                this.roomLock.isSeekerTurnLockAcquired = false;
                this.timer.start();
                break;
            }

            case GAME_STAGES.END: {
                this.timer.stop();
                break;
            }

            default:
                break;
        }

        this.status = newStatus;
    }

    /**
     * Removing player from the players list in the room by username
     * @param {string} username
     */
    removePlayerByUsername(username) {
        this.players = this.players.filter((player) => player.username !== username);
    }

    resumeGameAfterPlayerExited() {
        if (this.isKeeperInRoom()) this.advanceToNextSeeker();
        else this.setNextRound();
    }

    async onKeeperWordTimeout() {
        const release = await this.roomLock.acquire();
        try {
            if (!this.roomLock.isKeeperWordLockAcquired) {
                this.roomLock.isKeeperWordLockAcquired = true;
                // Ignore stale/double timers
                if (this.status !== GAME_STAGES.KEEPER_CHOOSING_WORD) return;

                this.setNextRound();
                this.callbacks?.onKeeperWordTimeout?.(this);
            }
        } finally {
            release();
        }
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
        const revealedLetters = this.getRevealedLetters();

        if (!lowerGuess.startsWith(revealedLetters.toLowerCase())) return { success: false, message: `Guess must start with ${revealedLetters}` };
        if (lowerGuess === this.currentRound?.keeperWord.toLowerCase()) return { success: false, message: "You can't guess your own word" };

        if (!activeClue.blocked && activeClue.word === lowerGuess) {
            this.timer.stop();
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

    async startNewClueRound(clueGiverUsername, clueWord, clueDefinition) {
        const { isValid, definitionFromApi } = await isValidEnglishWord(clueWord);
        if (!isValid) {
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
            return [false, `Word must start with ${revealedPrefix}`];
        }

        if (this.currentRound.clues.find((clue) => clue.word.toLowerCase() === clueWord.toLowerCase())) {
            Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
            return [false, "Invalid guess, this clue has already been given"];
        }
        if (clueDefinition.toLowerCase().includes(clueWord.toLowerCase())) {
            return [false, "Invalid guess, definition containing the word cannot be used."];
        }

        this.timer.stop(); //stop the clue submission timer
        this.currentRound.countOfClueSubmittersInPrefix++;
        const clue = new Clue(clueGiverUsername, clueWord, clueDefinition, definitionFromApi);
        this.currentRound.clues.push(clue);
        Logger.logClueSet(this.roomId, clueGiverUsername, clueDefinition);
        this.setStatus(GAME_STAGES.RACE);
        this.timer.setNewTimerDetails(TIMES.TURN_INTERVAL, this.handleRaceTimeout.bind(this), GAME_STAGES.RACE);
        this.roomLock.isRaceLockAcquired = false;
        this.timer.start();

        return [true];
    }

    async handleRaceTimeout() {
        const release = await this.roomLock.acquire();
        try {
            if (!this.roomLock.isRaceLockAcquired) {
                this.roomLock.isRaceLockAcquired = true;
                const prevClueGiverUsername = this.getCurrentClueGiverUsername();
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

                this.callbacks?.onRaceTimeout?.(this, prevClueGiverUsername);
            }
        } finally {
            release();
        }
    }

    async onClueSubmissionTimeout() {
        const release = await this.roomLock.acquire();
        try {
            if (!this.roomLock.isSeekerTurnLockAcquired) {
                this.roomLock.isSeekerTurnLockAcquired = true;
                // If someone didn't submit in time, advance to next seeker and repeat
                this.advanceToNextSeeker();
                this.setStatus(GAME_STAGES.CLUE_SUBMISSION);
                this.callbacks?.onClueSubmissionTimeout?.(this);
            }
        } finally {
            release();
        }
    }

    async getSuggestionsFromApi(prefix, username) {
        const suggestions = await getWordsByPrefix(prefix, this.currentRound.keeperWord);
        //for now i dont want points to be decreased
        // if (suggestions.length > 0) {
        //     this.decreasePointsToPlayerByUsername(username, POINTS.SUGGESTOINS_PENALTY);
        // }
        return suggestions;
    }

    async submitGuess(guesserUsername, guessWord, clueId) {
        const revealed = this.currentRound.revealedLetters;
        const revealedPrefix = revealed.toLowerCase();
        const guessLower = guessWord.toLowerCase();
        const definitionFromApi = this.currentRound?.getClueByClueId(clueId)?.definitionFromApi;
        const result = { correct: false, isGameEnded: false, message: "", definitionFromApi };

        // Prefix guard
        if (!guessLower.startsWith(revealedPrefix)) {
            Logger.logInvalidGuess(this.roomId, guessWord, revealedPrefix);
            result.message = "Guess must start with " + revealedPrefix;
            return result;
        }

        // De-dup
        if (this.currentRound.guesses.find((g) => g.word.toLowerCase() === guessLower)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);
            result.message = "Guess has already been submitted";
            return result;
        }

        this.currentRound.guesses.push(new Guess(guesserUsername, guessLower));

        const keeperWordLower = this.currentRound.keeperWord?.toLowerCase();
        result.keeperWord = this.currentRound.keeperWord;
        // 1) Secret word guessed directly -> immediate round end
        if (keeperWordLower && guessLower === keeperWordLower) {
            this.timer.stop();

            result.correct = true;
            result.isWordComplete = true;

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
            this.setNextRound(10);
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

                this.setNextRound(10);
                return result; // EARLY RETURN — do not override status
            }

            // Word not complete yet: keep playing within the same round
            this.addPointsToPlayerByUsername(guesserUsername, pointsToGive);
            this.addPointsToPlayerByUsername(clue.from, pointsToGive);

            this.timer.stop();
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
    setNextRound(delayTimer = 0) {
        // Stop all timers from previous round to avoid stale/double fire
        this.timer.stop();
        this.roundsHistory.push(this.currentRound);
        if (this.keeper && this.isLastKeeper) this.keeper.wasKeeper = true;

        if (this.isGameOver()) {
            this.endGame();
        } else {
            const nextKeeperUsername = this.getNextKeeper();
            this.players.find((player) => player.username === nextKeeperUsername).setRole(ROLES.KEEPER);
            this.players.forEach((player) => {
                if (player.username !== nextKeeperUsername) player.setRole(ROLES.SEEKER);
            });

            this.players.forEach((player) => {
                player.numOfTurnsToSubmitAClueInARoundAsSeeker = 0;
            });
            this.advanceToNextSeeker();
            this.currentRound = new GameRound();
            this.currentRound.roundNum = this.roundsHistory.length + 1;

            // Start seeker cycle from the beginning each round
            this.setStatus(GAME_STAGES.KEEPER_CHOOSING_WORD, delayTimer);
            Logger.logNextKeeper(this.roomId, nextKeeperUsername);
        }
    }

    getNextKeeper() {
        const currentKeeper = this.keeper;
        if (currentKeeper) currentKeeper.wasKeeper = true;
        for (const player of this.players) {
            if (player.username !== this.keeperUsername && !player.wasKeeper) {
                return player.username;
            }
        }
        return null;
    }

    //looking for the seeker with the least number of turns to submit a clue in a round
    advanceToNextSeeker() {
        let nextSeeker = this.seekersAsPlayers[0] ?? null;
        let currentMin = nextSeeker.numOfTurnsToSubmitAClueInARoundAsSeeker;
        for (const player of this.seekersAsPlayers) {
            if (player.numOfTurnsToSubmitAClueInARoundAsSeeker < currentMin) {
                nextSeeker = player;
                currentMin = player.numOfTurnsToSubmitAClueInARoundAsSeeker;
            }
        }
        nextSeeker.numOfTurnsToSubmitAClueInARoundAsSeeker++;
        this.currentClueGiverUsername = nextSeeker.username;
        return nextSeeker.username;
    }

    isGameOver() {
        return this.players.every((player) => player.wasKeeper);
    }

    addPointsToPlayerByUsername(username, points) {
        const p = this.players.find((player) => player.username === username);
        if (p) p.addScore(points);
    }

    decreasePointsToPlayerByUsername(username, points) {
        const p = this.players.find((player) => player.username === username);
        if (p && p.gameScore >= points) p.addScore(-points);
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
        const regex = /^[A-Za-z]+$/;

        if (!regex.test(word)) {
            return [false, "Word must contain only letters A-Z"];
        }

        if (this.keepersWordsHistory.has(word)) {
            return [false, "Previous keeper has already chose this word, Please enter another word"];
        }

        const { isValid } = await isValidEnglishWord(word);

        if (!isValid) {
            Logger.logInvalidKeeperWord(this.roomId, word);
            return [false, "Invalid English word, please try again"];
        }

        // add guard against timer changing

        this.currentRound.setKeeperWord(word);
        this.timer.stop();

        Logger.logKeeperWordSet(this.roomId, word);
        return [true];
    }
}

module.exports = Room;
