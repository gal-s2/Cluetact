const { v4: uuidv4 } = require("uuid");

class Clue {
    constructor(clueGiverUsername, clueWord, clueDefinition) {
        this.id = uuidv4();
        this.from = clueGiverUsername;
        this.word = clueWord.toLowerCase();
        this.definition = clueDefinition;
        this.blocked = false;
    }
}

module.exports = Clue;
