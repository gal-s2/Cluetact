const DEBUG = false;

/**
 * GameQueue class manages the queue of users waiting to join a game.
 */
class GameQueue {
    static minUsersInRoom = 3;
    static maxUsersInRoom = 6;

    constructor() {
        this.awaitingUsers = [];
    }

    /**
     * Adds a user to the game queue.
     * @param {User} user
     * @returns {[boolean, string[]]} - Returns an object with roomCreationPossible flag and chosenUsers array.
     */
    addUser(user) {
        if (DEBUG) console.log("[GameQueue] Adding user to queue:", user.username);

        // if user already in queue, he cannot enter again
        if (this.awaitingUsers.find((awaitingUser) => user.username === awaitingUser.username)) {
            return false;
        }

        this.awaitingUsers.push(user);

        return true;
    }

    /**
     * Removes a user from the queue.
     * @param {string} username - The username of the user to remove.
     */
    removeUser(username) {
        if (DEBUG) console.log("[GameQueue] Removing user from queue:", username);

        const index = this.awaitingUsers.findIndex((awaitingUser) => awaitingUser.username === username);
        if (index !== -1) {
            this.awaitingUsers.splice(index, 1);
        }
    }

    /**
     * Gets users ready to start a game.
     * @returns {string[] | null} - Returns an array of usernames ready to start a game, or null if not enough users.
     */
    getReadyUsers() {
        if (this.awaitingUsers.length >= GameQueue.minUsersInRoom) {
            const count = Math.min(this.awaitingUsers.length, GameQueue.maxUsersInRoom);
            return this.awaitingUsers.splice(0, count); // return and remove
        }
        return null;
    }

    /**
     * Gets all users currently in the queue.
     * @returns {string[]} - Returns an array of all usernames currently in the queue.
     */
    getAllUsers() {
        return [...this.awaitingUsers];
    }
}

module.exports = GameQueue;
