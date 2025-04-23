// routes/stats.js
const router = require("express").Router();
const User = require("../models/User");

// GET /api/stats/:userId
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ statistics: user.statistics });
    } catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
