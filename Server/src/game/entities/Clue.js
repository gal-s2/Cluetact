const { v4: uuidv4 } = require("uuid");

class Clue {
    constructor(clueGiverUsername, clueWord, clueDefinition, definitionFromApi) {
        this.id = uuidv4();
        this.from = clueGiverUsername;
        this.word = clueWord.toLowerCase();
        this.definition = clueDefinition;
        this.blocked = false;
        this.active = true;
        this.definitionFromApi = definitionFromApi;
    }
}

module.exports = Clue;
