class Player {
    constructor(username) {
        this.username = username;
        this.gameScore = 0;
        this.role = null;
        this.avatar = "0";
    }

    setRole(role) {
        this.role = role;
    }

    addScore(points) {
        this.gameScore += points;
    }
}

module.exports = Player;
