const mongoose = require("mongoose");
const Room = require("./game/Room");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

const predefinedInputs = [
    // סבב ראשון (Alice123 keeper)
    "dog", // keeper word
    "Charlie22", // clue giver
    "dry", // clue word
    "not wet", // definition
    "Bob12223", // guesser
    "dry", // guess
    "Bob12223", // clue giver
    "orange", // clue word
    "fruit", // definition
    "Charlie22", // guesser
    "orange", // guess

    // סבב שני (Bob12223 keeper)
    "you", // keeper word
    "Alice123", // clue giver
    "you", // clue word
    "yourself", // definition
    "Charlie22", // guesser
    "you", // guess
    "Charlie22", // clue giver
    "or", // clue word
    "logic", // definition
    "Alice123", // guesser
    "or", // guess

    // סבב שלישי (Charlie22 keeper)
    "tea", // keeper word
    "Alice123", // clue giver
    "thanks", // clue word
    "gratitude", // definition
    "Bob12223", // guesser
    "thanks", // guess
    "Alice123", // clue giver
    "ear", // clue word
    "hearing", // definition
    "Bob12223", // guesser
    "ear", // guess
];

let inputIndex = 0;
const prompt = async (question) => {
    const answer = predefinedInputs[inputIndex++];
    console.log(`${question}${answer}`);
    return answer;
};

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB for manual test");

    const keeper = "Alice123";
    const seekers = ["Bob12223", "Charlie22"];
    const room = new Room("manualRoom", "waiting", keeper, seekers);

    await room.runGame(prompt);

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected. Test complete.");
}

main();
