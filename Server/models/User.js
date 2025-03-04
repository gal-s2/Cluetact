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
    }
});

// static register method
UserSchema.statics.register = async function (username, email, password, gender, country) {

    // validate user

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ username, email, password: hash, gender, country, level: 1 });
    return user;
}

module.exports = mongoose.model('User', UserSchema);