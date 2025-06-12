const router = require("express").Router();
const User = require("../models/User");
const socketManager = require("../game/managers/SocketManager");
const { generateToken } = require("../utils/jwt");

router.post("/guest", (req, res) => {
    try {
        const guestCount = socketManager.addAndFetchGuestCount();
        const user = {
            username: `GUEST_${guestCount}`,
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

router.post("/logout", (req, res) => {
    try {
        const { username } = req.body;

        if (username && username.startsWith("GUEST_")) {
            console.log(`Guest ${username} logged out`);
        } else if (username) {
            console.log(`User ${username} logged out`);
        } else {
            console.log(`Unknown user tried to logout`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/disconnect", (req, res) => {
    try {
        const { username } = req.body;

        if (username && username.startsWith("GUEST_")) {
            console.log(`Guest user ${username} disconnected`);
        } else if (username) {
            console.log(`User ${username} disconnected`);
        } else {
            console.log(`Unknown user tried to disconnect`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
