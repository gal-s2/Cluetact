const router = require('express').Router();

const User = require('../models/User');

router.post('/register', async (req, res) => {
    console.log('in register', req.body);

    const { username, email, password } = req.body;

    try {
        const user = await User.register(username, email, password);
        res.status(200).json({ user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        res.status(200).json({ user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


module.exports = router;