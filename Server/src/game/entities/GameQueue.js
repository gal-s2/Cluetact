/**
 * GameQueue class manages the queue of users waiting to join a game.
 */
class GameQueue {
    static minUsersInRoom = 3;
    static userInstance = null;

    constructor() {
        if (GameQueue.userInstance) return GameQueue.userInstance;
        this.awaitingUsers = [];
        GameQueue.userInstance = this;
    }

    /**
     * Adds a user to the game queue.
     * @param {User} user
     * @returns {[boolean, string[]]} - Returns an object with roomCreationPossible flag and chosenUsers array.
     */
    addUser(user) {
        console.log("[GameQueue] Adding user to queue:", user.username);
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

    /**
     * Removes a user from the queue.
     * @param {string} username - The username of the user to remove.
     */
    removeUser(username) {
        console.log("[GameQueue] Removing user from queue:", username);
        const index = this.awaitingUsers.findIndex((awaitingUser) => awaitingUser.username === username);
        if (index !== -1) {
            this.awaitingUsers.splice(index, 1);
        }
    }
}

module.exports = GameQueue;
