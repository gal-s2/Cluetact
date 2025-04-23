const readline = require("readline");
const mongoose = require("mongoose");
const Room = require("./game/Room");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for manual test");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = (question) => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => resolve(answer.trim()));
        });
    };

    const keeper = "Alice123";
    const seekers = ["Bob12223", "Charlie22"];

    const room = new Room("manualRoom", "waiting", keeper, seekers);

    const getWordFromSocket = async () => {
        return await prompt(`${keeper}, enter your secret word: `);
    };

    await room.runGame(prompt, getWordFromSocket);

    rl.close();
    await mongoose.disconnect();
    console.log("MongoDB disconnected. Test complete.");
}

main();
