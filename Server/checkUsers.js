const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

(async () => {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({});
    console.log(
        "📋 Users in DB:",
        users.map((u) => u.username)
    );
    await mongoose.disconnect();
})();
