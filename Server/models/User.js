const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { uniqueNamesGenerator } = require("unique-names-generator");
const descriptors = ["black", "blue", "crimson", "dark", "golden", "icy", "red", "silver", "stealthy", "speedy", "swift", "tiny", "wild", "wise", "fierce", "quick", "sharp", "brave", "calm", "cool"];
const animals = ["cat", "dog", "fox", "wolf", "hawk", "bear", "owl", "lynx", "panther", "cheetah", "lion", "tiger", "cobra", "raven", "eagle", "koala", "otter", "bat", "ferret", "puma"];

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        required: requiredIfNotGuest,
    },
    password: {
        type: String,
        required: requiredIfNotGuest,
    },
    country: {
        type: String,
        required: false,
    },

    statistics: {
        totalGames: { type: Number, default: 0 },
        Losses: { type: Number, default: 0 },
        Wins: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
    },
    avatar: {
        type: String,
        default: "0",
    },
    guest: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24,
    },
});

function requiredIfNotGuest() {
    return !this.guest;
}

// static register method
UserSchema.statics.register = async function (userData) {
    const { username, email, password, gender, country } = userData;

    // validate user here

    const exists = await this.findOne({
        $or: [{ email }, { username }],
    });
    if (exists) {
        throw Error("Username or email already in use");
    }
    if (username.endsWith("[Guest]")) {
        throw Error("Username cannot end with '[Guest]'");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({
        username,
        email,
        password: hash,
        gender,
        country,
    });

    return user;
};

UserSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username });

    if (!user) throw Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw Error("Invalid credentials");

    return user;
};

UserSchema.statics.createGuest = async function () {
    let username;
    let exists = true;

    while (exists) {
        const rawName = uniqueNamesGenerator({
            dictionaries: [descriptors, animals],
            separator: "",
            style: "capital",
        });

        const number = Math.floor(Math.random() * 99) + 1;
        username = `${rawName}${number}[Guest]`;
        exists = await this.findOne({ username });
    }

    const guest = await this.create({
        guest: true,
        username,
    });

    console.log("Created guest:", username);
    return guest;
};

UserSchema.statics.userExists = async function (username) {
    const user = await this.findOne({ username });
    return !!user;
};

module.exports = mongoose.model("User", UserSchema);
