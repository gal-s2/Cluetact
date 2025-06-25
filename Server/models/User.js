const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { uniqueNamesGenerator } = require("unique-names-generator");
const descriptors = ["black", "blue", "crimson", "dark", "golden", "icy", "red", "silver", "stealthy", "speedy", "swift", "tiny", "wild", "wise", "fierce", "quick", "sharp", "brave", "calm", "cool"];
const animals = ["cat", "dog", "fox", "wolf", "hawk", "bear", "owl", "lynx", "panther", "cheetah", "lion", "tiger", "cobra", "raven", "eagle", "koala", "otter", "bat", "ferret", "puma"];

const UserSchema = new mongoose.Schema({
    authProvider: {
        type: String,
        enum: ["local", "google", "guest"],
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        required: requiredIfNotGuestUser,
    },
    password: {
        type: String,
        required: requiredIfLocalUser,
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
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
});

function requiredIfNotGuestUser() {
    return this.authProvider !== "guest";
}

function requiredIfLocalUser() {
    return this.authProvider === "local";
}

UserSchema.statics.generateRandomUsername = async function generateRandomUsername() {
    let username;
    let exists = true;

    while (exists) {
        const rawName = uniqueNamesGenerator({
            dictionaries: [descriptors, animals],
            separator: "",
            style: "capital",
        });

        const number = Math.floor(Math.random() * 99) + 1;
        username = `${rawName}${number}`;
        exists = await this.findOne({ username });
    }

    return username;
};

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
        authProvider: "local",
    });

    return user;
};

UserSchema.statics.loginWithGoogle = async function (googleId, email) {
    let user = await this.findOne({ googleId });

    if (!user) {
        user = await this.findOne({ email });
        if (user && !user.googleId) {
            user.googleId = googleId;
            user.authProvider = "google";
            await user.save();
            return user;
        }
        const username = await this.generateRandomUsername();
        user = await this.create({
            googleId,
            email,
            username,
            authProvider: "google",
        });
    }

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
    const username = await this.generateRandomUsername();

    const guest = await this.create({
        guest: true,
        username,
        authProvider: "guest",
    });

    return guest;
};

UserSchema.statics.userExists = async function (username) {
    const user = await this.findOne({ username });
    return !!user;
};

UserSchema.statics.updateProfile = async function (userId, updateFields) {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.guest && updateFields.password) {
        throw new Error("Guests are not allowed to set a password");
    }

    if (updateFields.password) {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(updateFields.password, salt);
    }

    const updatedUser = await this.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, select: "-password" });

    return updatedUser;
};

module.exports = mongoose.model("User", UserSchema);
