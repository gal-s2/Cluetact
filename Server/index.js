const express = require('express');
const mongoose = require('mongoose');
const redis = require('./config/redis')
mongoose.connect('mongodb://localhost:27017/');

const app = express();

app.use(express.json());

// Import enviroment variables file
require('dotenv').config()

const PORT = process.env.PORT || 8000;



// Import all routers from ./routes/index.js
app.use(require('./routes'));

// Server listens on enviroment defined port
app.listen(PORT, () => {
    console.log(`Cluetact Server is running on port ${PORT}`);
});