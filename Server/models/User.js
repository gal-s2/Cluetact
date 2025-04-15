const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        required: false
    },
    online: {
        type: Boolean,
        default: false,
        required: true
    }
    /*statistics: {
        gamesPlayed:         { type: Number, default: 0 },
        gamesWon:            { type: Number, default: 0 },
        winRate:             { type: Number, default: 0 }
        // add more as needed
      }*/
});

// static register method
UserSchema.statics.register = async function (userData) {
    const { username, email, password, gender, country} = userData;

    // validate user here

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ 
        username,
        email,
        password: hash, 
        gender,
        country,
        level: 1
    });

    return user;
}

UserSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {
        throw Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw Error('Invalid credentials');
    }

    return user;
};

module.exports = mongoose.model('User', UserSchema);