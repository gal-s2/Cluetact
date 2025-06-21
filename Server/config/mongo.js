const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Cluetact";

const connectMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Mongo successfully.");
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

connectMongo();
