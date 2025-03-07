const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhose:27017/';
//const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/';

const connectMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Mongo successfully.');
    } catch(error) {
        console.log('MongoDB Connection Error:', error);
        process.exit(1);
    }
}

connectMongo();