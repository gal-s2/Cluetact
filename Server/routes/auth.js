const router = require("express").Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

router.post("/guest", (req, res) => {
    try {
        const user = {
            username: `Guest_1`,
            _id: 1,
        };
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ error: err.message });
    }
});

router.post("/register", async (req, res) => {
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

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.id, {
            online: false,
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/disconnect", (req, res) => {
    try {
        // Example logic: maybe no need to touch DB for guests
        // For registered users, you could mark them offline
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required." });
        }

        // Example: skip DB update for guests
        if (username.startsWith("GUEST_")) {
            console.log(`Guest user ${username} disconnected`);
            return res.json({ success: true });
        }

        // For registered users: mark them offline in DB
        User.findOneAndUpdate({ username }, { online: false })
            .then(() => res.json({ success: true }))
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: "Server error" });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
