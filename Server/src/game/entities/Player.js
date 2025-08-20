class Player {
    constructor(username, avatar) {
        this.username = username;
        this.gameScore = 0;
        this.role = null;
        this.avatar = avatar;
        this.wasKeeper = false;
        this.numOfTurnsToSubmitAClueInARoundAsSeeker = 0;
    }

    //[ido,true]  [gal,false] [mosh, false]

    setRole(role) {
        this.role = role;
    }

    addScore(points) {
        this.gameScore += points;
    }
}

module.exports = Player;
