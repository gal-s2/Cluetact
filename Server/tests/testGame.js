const readline = require("readline");
const Room = require("../game/Room");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

// הרצה
const room = new Room(1, "Created", "u1", ["u2", "u3"], {
    u1: "Alice",
    u2: "Bob",
    u3: "Charlie",
});

room.runGame(prompt).then(() => rl.close());
