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
        // Rule 1: Only seekers can give clues
        if (clueGiverId === this.keeperId) {
            console.log(`[Room ${this.roomId}]  Keeper cannot give clues.`);
            return false;
        }
    
        // Rule 2: Clue word must start with the LAST revealed letter
        const lastLetter = this.currentSession.revealedLetters.slice(-1).toLowerCase();
        if (!clueWord.toLowerCase().startsWith(lastLetter)) {
            console.log(`[Room ${this.roomId}]  Clue word "${clueWord}" must start with '${lastLetter}'`);
            return false;
        }
    
        // Set clue word + definition into session
        this.currentSession.setClue(clueGiverId, clueWord, clueDefinition);
    
        // Share the definition before race starts (for UI, logs, etc.)
        console.log(`[Room ${this.roomId}]  Clue set by ${clueGiverId}: "${clueDefinition}"`);
    
        // Start timer for guessing race
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
            console.log(` Invalid guess "${guessWord}" — must start with '${lastLetter}'`);
            return false;
        }
    
        if (session.guesses.find(g => g.word === guessWord)) {
            console.log(`[Room ${this.roomId}] Word "${guessWord}" was already guessed.`);
            return false;
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
    
        console.log(`[Room ${this.roomId}] ${guesserId} guessed the clue word. +${pointsEarned} pts`);
        console.log(`[Room ${this.roomId}] Revealed: ${session.revealedLetters}`);
    
        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    
        if (isWordFullyRevealed) {
            const nextKeeper = this.getNextKeeper();
            this.keeperId = nextKeeper;
            this.players[nextKeeper].setRole('keeper');
    
            Object.keys(this.players).forEach(id => {
                if (id !== nextKeeper) this.players[id].setRole('seeker');
            });
    
            this.pastKeepers.add(nextKeeper);
            this.currentSession = new (require('./GameSession'))();
    
            console.log(`[Room ${this.roomId}] Word fully revealed. Next keeper: ${this.players[nextKeeper].username}`);
    
            if (this.isGameOver()) {
                this.endGame();
            }
        }
    }
    
    
    


    handleKeeperGuess(keeperId) {
        const session = this.currentSession;
        console.log(`[Room ${this.roomId}] Keeper ${keeperId} guessed the clue word correctly.`);

        this.players[keeperId].addScore(15); 
        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    }

    handleKeeperWordGuess(userId) {
        const keeperWord = this.currentSession.keeperWord;

        console.log(`[Room ${this.roomId}] ${userId} attempted to guess the keeper's word!`);

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
            console.log(`[Room ${this.roomId}]  Keeper word "${word}" is invalid.`);
            return false;
        }
    
        this.currentSession.setKeeperWord(word);
        console.log(`[Room ${this.roomId}]  Keeper word set: "${word}"`);
        return true;
    }
    

    rotateRoles() {
        if (this.isGameOver()) {
            this.endGame();
        }
        this.keeperId = this.getNextKeeper();
        this.pastKeepers.add(this.keeperId);
        this.players[this.keeperId].setRole('keeper');

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

        console.log(`[Room ${this.roomId}] Time's up! No one guessed the clue word.`);

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

        console.log(`[Room ${this.roomId}] Game Over. Winner(s):`, winners.map(p => p.username));

        // TODO: Save to MongoDB (can do later)
    }



}

module.exports = Room;