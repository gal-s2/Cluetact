class Player {
    constructor(username, avatar = "0") {
        this.username = username;
        this.gameScore = 0;
        this.role = null;
        this.avatar = avatar;
    }

    setRole(role) {
        this.role = role;
    }

    addScore(points) {
        this.gameScore += points;
    }
}

module.exports = Player;
