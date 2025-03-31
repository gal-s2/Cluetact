const Player = require('./Player');
const GameSession = require('./GameSession')

class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds, usernamesMap = {}) {
        this.roomId = roomId;
        this.status = status; // Created, inProgress, Ended
        this.keeperId = keeperId; 
        this.listOfSeekersIds = listOfSeekersIds;
        this.currentSession = new GameSession();

         // Add keeper
         const keeper = new Player(keeperId, usernamesMap[keeperId] || 'Unknown');
         keeper.setRole('keeper');
         this.players[keeperId] = keeper;
 
         // Add seekers
         listOfSeekersIds.forEach((id) => {
             const seeker = new Player(id, usernamesMap[id] || 'Unknown');
             seeker.setRole('seeker');
             this.players[id] = seeker;
         });
         this.pastKeepers = new Set(); // track who has already been keeper
         this.pastKeepers.add(keeperId); // add first keeper

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
        console.log(`[Room ${this.roomId}] Clue set by ${clueGiverId} for word "${clueWord}". Race begins.`);
    }

    submitGuess(userId, guessWord) {
        const session = this.currentSession;
    
        // Skip if session not active
        if (session.status !== 'race') return;
    
        // If this word was already guessed, ignore
        if (session.guesses.includes(guessWord)) return;
    
        session.addGuess(guessWord);
    
        // Check if guess matches clue target word
        if (guessWord.toLowerCase() === session.clueTargetWord.toLowerCase()) {
            this.handleCorrectGuess(userId);
        }
    
        // Check if guess matches keeper word (risky guess)
        else if (guessWord.toLowerCase() === session.keeperWord.toLowerCase()) {
            this.handleKeeperWordGuess(userId);
        }
    }

    handleCorrectGuess(guesserId) {
        const session = this.currentSession;
        const clueGiverId = session.clueGiverId;
    
        console.log(`[Room ${this.roomId}] ${guesserId} guessed the clue word correctly!`);
    
        // Award points to clue giver and guesser
        this.players[guesserId].addScore(10);       // Example value
        this.players[clueGiverId].addScore(10);      // Example value
    
        // Reveal next letter
        session.revealNextLetter();
    
        // Clear clue state
        session.clueGiverId = null;
        session.clueTargetWord = null;
        session.status = 'waiting';
    }

    handleKeeperGuess(keeperId) {
        const session = this.currentSession;
        console.log(`[Room ${this.roomId}] Keeper ${keeperId} guessed the clue word correctly.`);
    
        this.players[keeperId].addScore(15); // Example: bonus for blocking seekers
    
        // Do NOT reveal the next letter
        // Clue round ends without progress
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
    
    
    
    
    

}

module.exports = Room;