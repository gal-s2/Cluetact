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
    addUser(id) {
        let roomCreationPossible = false;
        let chosenUsers = [];

        this.awaitingUsers.push(id);
        if (this.awaitingUsers.length >= GameQueue.minUsersInRoom)  {
            roomCreationPossible = true;
            chosenUsers = this.awaitingUsers.splice(0,3);
        }

        return {roomCreationPossible,chosenUsers};
    }

    // removeUser(id) {
    //     this.awaitingUsers.delete(id);
    // }

    // removeChosenUsers(ids) {
    //     this.awaitingUsers.forEach((id) => {
    //         this.removeUser(id);
    //     });
    // }

    }

    module.exports = GameQueue;
    



