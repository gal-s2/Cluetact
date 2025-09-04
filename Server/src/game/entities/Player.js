class Player {
    constructor(user, avatar) {
        this.username = user.username;
        this.gameScore = 0;
        this.role = null;
        this.avatar = avatar;
        this.wasKeeper = false;
        this.numOfTurnsToSubmitAClueInARoundAsSeeker = 0;
        this.country = user.country || "IL";
        this.wins = user.statistics.Wins;
        this.totalGames = user.statistics.totalGames;
    }

    setRole(role) {
        this.role = role;
    }

    addScore(points) {
        this.gameScore += points;
    }
}

module.exports = Player;
