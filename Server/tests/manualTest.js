const mongoose = require("mongoose");
const Room = require("../game/Room");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

const predefinedInputs = [
    // סבב ראשון (Alice123 keeper)
    "dog", // keeper word
    "Chadsdsrlie222!", // clue giver
    "dry", // clue word
    "not wet", // definition
    "Bob1dsds2223!", // guesser
    "dry", // guess
    "Bob1dsds2223!", // clue giver
    "orange", // clue word
    "fruit", // definition
    "Chadsdsrlie222!", // guesser
    "orange", // guess

    // סבב שני (Bob12223 keeper)
    "you", // keeper word
    "Alicxcde123ֿ!", // clue giver
    "you", // clue word
    "yourself", // definition
    "Chadsdsrlie222!", // guesser
    "you", // guess
    "Chadsdsrlie222!", // clue giver
    "or", // clue word
    "logic", // definition
    "Alicxcde123ֿ!", // guesser
    "or", // guess

    // סבב שלישי (Charlie22 keeper)
    "tea", // keeper word
    "Alicxcde123ֿ!", // clue giver
    "thanks", // clue word
    "gratitude", // definition
    "Bob1dsds2223!", // guesser
    "thanks", // guess
    "Alicxcde123ֿ!", // clue giver
    "ear", // clue word
    "hearing", // definition
    "Bob1dsds2223!", // guesser
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

    const keeper = "Alicxcde123ֿ!";
    const seekers = ["Bob1dsds2223!", "Chadsdsrlie222!"];
    const room = new Room("manualRoom", "waiting", keeper, seekers);

    await room.runGame(prompt);

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected. Test complete.");
}

main();
