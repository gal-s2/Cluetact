class GameQueue {
    static minUsersInRoom = 3;
    static userInstance = null;

    constructor() {
        if (GameQueue.userInstance) return GameQueue.userInstance;
        this.awaitingUsers = [];
        GameQueue.userInstance = this;
    }

    // return value: [boolean,arr] where boolean is true if there are enough users to start a room
    // arr is the id's of these users (only appear if true)
    addUser(user) {
        let roomCreationPossible = false;
        let chosenUsers = [];

        // if user already in queue, he cannot enter again
        if (this.awaitingUsers.find((awaitingUser) => user.username === awaitingUser.username)) {
            return { roomCreationPossible };
        }

        this.awaitingUsers.push(user);
        if (this.awaitingUsers.length >= GameQueue.minUsersInRoom) {
            roomCreationPossible = true;
            chosenUsers = this.awaitingUsers.splice(0, 3);
        }

        return { roomCreationPossible, chosenUsers };
    }
}

module.exports = GameQueue;
