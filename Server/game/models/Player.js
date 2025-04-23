class Player {
    constructor(username) {
        this.username = username;
        this.gameScore = 0;
        this.role = null;
        this.isReady = false;
        this.socket = null;
    }

    setSocket(socket) {
        this.socket = socket;
    }

    setRole(role) {
        this.role = role;
    }

    markReady(isReady) {
        this.isReady = isReady;
    }

    addScore(points) {
        this.gameScore += points;
    }
}

module.exports = Player;