const Player = require('./Player');
const GameSession = require('./GameSession')
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


    startNewClueRound(clueGiverId, clueWord) {
        this.currentSession.setClue(clueGiverId, clueWord);

        // Start the race timer
        this.raceTimer = setTimeout(() => {
            this.handleClueTimeout(); // called if time runs out
        }, MAX_RACE_TIME);

        console.log(`[Room ${this.roomId}] Clue set by ${clueGiverId}, race started.`);
    }



    submitGuess(userId, guessWord) {
        const session = this.currentSession;
        if (session.status !== 'race') return;

        if (session.guesses.includes(guessWord)) return;
        session.addGuess(guessWord);

        if (guessWord.toLowerCase() === session.clueTargetWord.toLowerCase()) {
            const timeElapsed = (new Date() - session.raceStartTime) / 1000;
            this.handleCorrectGuess(userId, timeElapsed);
            clearTimeout(this.raceTimer); // stop the countdown
        } else if (guessWord.toLowerCase() === session.keeperWord.toLowerCase()) {
            this.handleKeeperWordGuess(userId);
        }
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
    
        //  If the full word has been revealed, rotate keeper
        if (isWordFullyRevealed) {
            const nextKeeper = this.getNextKeeper();
            this.keeperId = nextKeeper;
            this.players[nextKeeper].setRole('keeper');
    
            // Set others as seekers
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