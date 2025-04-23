const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

const testUsers = [
    {
        username: "Alicxcde123ֿ!",
        password: "test123",
        email: "alice@dsexample.com",
        gender: "female",
        country: "Wonderland",
    },
    {
        username: "Bob1dsds2223!",
        password: "test123",
        email: "bdsob@example.com",
        gender: "male",
        country: "USA",
    },
    {
        username: "Chadsdsrlie222!",
        password: "test123",
        email: "charsdlie@example.com",
        gender: "other",
        country: "UK",
    },
];

async function createUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        for (const u of testUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.register(u);
                console.log(`👤 Created user: ${u.username}`);
            } else {
                console.log(`ℹ User already exists: ${u.username}`);
            }
        }

        await mongoose.disconnect();
        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    }
}

createUsers();
