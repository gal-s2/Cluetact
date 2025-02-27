const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});