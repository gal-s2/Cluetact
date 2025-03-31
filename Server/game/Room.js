const Player = require('./Player');
const GameSession = require('./GameSession')

class Room {
    constructor(roomId, status, keeperId, listOfSeekersIds, usernamesMap = {}) {
        this.roomId = roomId;
        this.status = status; // Created, inProgress, Ended
        this.keeperId = keeperId; 
        this.listOfSeekersIds = listOfSeekersIds;
        this.currentSession = new GameSession();
        this.raceTimer = null; // Holds the timeout reference

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
        
            console.log(`[Room ${this.roomId}] ${guesserId} guessed correctly in ${timeElapsed.toFixed(2)}s. +${pointsEarned} pts`);
        
            session.revealNextLetter();
            session.status = 'waiting';
            session.clueGiverId = null;
            session.clueTargetWord = null;
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