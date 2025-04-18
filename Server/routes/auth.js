const router = require('express').Router();
const User = require('../models/User');
const { generateToken } = require('../auth');

router.post('/register', async (req, res) => {
    console.log('in register', req.body);

    const userData = req.body;

    try {
        const user = await User.register(userData);
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.id, { online: false});
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
})

module.exports = router;