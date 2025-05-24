const { v4: uuidv4 } = require("uuid");

class Clue {
    constructor(clueGiverId, clueWord, clueDefinition) {
        this.id = uuidv4();
        this.from = clueGiverId;
        this.word = clueWord.toLowerCase();
        this.definition = clueDefinition;
        this.blocked = false;
    }
}

module.exports = Clue;
