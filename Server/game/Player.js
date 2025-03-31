class Player {

    constructor(userId, username) {
        this.userId = userId;
        this.username = username;
        this.gameScore = 0;
        this.role = null; 
        this.isReady = false;
       
    }

    setRole(role) {
        this.role = role;
    }

    markReady(isReady) {
        this.isReady = true;
    }

    addScore(points) {
        this.gameScore += points;
    }
    


}

module.exports = Player;