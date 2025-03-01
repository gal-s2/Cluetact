const express = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import enviroment variables file
require('dotenv').config()

// Import all routers from ./routes/index.js
app.use(require('./routes'));

// Server listens on enviroment defined port
app.listen(PORT, () => {
    console.log(`Cluetact Server is running on port ${PORT}`);
});