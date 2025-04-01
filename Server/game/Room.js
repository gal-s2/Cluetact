const Player = require('./Player');
const GameSession = require('./GameSession')
const isValidEnglishWord = require('./validateWord');
const Logger = require('./Logger');


// Configurable constants (can be change)
const MAX_RACE_TIME = 10000;        // 10 seconds
const BASE_POINTS = 15;             // max points for instant guess
const PENALTY_RATE = 2;             // -2 points per second delay
const CLUE_FAIL_PENALTY = 5;        // penalty for clue giver if time runs out


class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds, usernamesMap = {}) {
        this.roomId = roomId;
        this.status = status;

        this.keeperId = keeperId;
        
        this.players = {};

        this.currentSession = new GameSession();

        this.turnQueue = listOfSeekersIds.slice(); // Clone the seekers list


       
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

    addPlayer(userId) {
        const player = GameFactory.createPlayer(userId);
        this.listOfSeekersIds[userId] = player;
    }

    removePlayer(userId) {
        delete this.listOfSeekersIds[userId];
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
            return false;
        }
    
        if (session.guesses.find(g => g.word === guessWord)) {
            Logger.logDuplicateGuess(this.roomId, guessWord);            return false;
        }
    
        session.addGuess(userId, guessWord);
    
        if (guessWord.toLowerCase() === session.clueTargetWord?.toLowerCase()) {
            const timeElapsed = (new Date() - session.raceStartTime) / 1000;
            this.handleCorrectGuess(userId, timeElapsed);
            clearTimeout(this.raceTimer);
            return true;
        }
    
        if (guessWord.toLowerCase() === session.keeperWord?.toLowerCase()) {
            this.handleKeeperWordGuess(userId);
            return true;
        }
    
        return false; // Guess was valid format but incorrect
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
            const currentKeeperId = this.keeperId;          // Store the one who just finished
            this.pastKeepers.add(currentKeeperId);          // Mark them as done
        
            const nextKeeper = this.getNextKeeper();        // Assign new one
            this.keeperId = nextKeeper;
            this.players[nextKeeper].setRole('keeper');
        
            Object.keys(this.players).forEach(id => {
                if (id !== nextKeeper) this.players[id].setRole('seeker');
            });
        
            this.currentSession = new (require('./GameSession'))();
            
            Logger.logNextKeeper(this.roomId, this.players[nextKeeper].username);
        
            // ✅ Only end if the NEXT keeper has already played
            if (this.pastKeepers.has(nextKeeper)) {
                this.endGame();
            }
        }
    }
        
    
    
    


    handleKeeperGuess(keeperId) {
        const session = this.currentSession;
        Logger.logKeeperGuessedClue(this.roomId, keeperId);
        this.players[keeperId].addScore(15); 
        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    }

    handleKeeperWordGuess(userId) {
        const keeperWord = this.currentSession.keeperWord;

        Logger.logKeeperWordGuessAttempt(this.roomId, userId);

        if (this.currentSession.status === 'ended') return;

        // Correct
        if (this.currentSession.keeperWord.toLowerCase() === guessWord.toLowerCase()) {
            this.players[userId].addScore(50); // High reward
            this.currentSession.endSession();
        } else {
            this.players[userId].addScore(-20); // Risky penalty
        }
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
    

    rotateRoles() {
        if (this.isGameOver()) {
            this.endGame();
        }
        this.pastKeepers.add(this.keeperId); // Add the keeper who just finished

this.keeperId = nextKeeper;
this.players[nextKeeper].setRole('keeper');

Object.keys(this.players).forEach(id => {
    if (id !== nextKeeper) this.players[id].setRole('seeker');
});


        // Reset others to 'seeker'
        for (const id in this.players) {
            if (id !== this.keeperId) {
                this.players[id].setRole('seeker');
            }
        }

        this.currentSession = new GameSession();
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

        // Find the player(s) with the highest score
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
        // TODO: Save to MongoDB (can do later)
    }



}

module.exports = Room;