const router = require("express").Router();
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

router.patch("/update-profile", requireAuth, async (req, res) => {
    try {
        console.log("🔧 PATCH /user/update-profile hit");

        const { id: userId } = req.user;
        const { avatar, password } = req.body;

        const updateFields = {};
        if (avatar) updateFields.avatar = avatar;
        if (password && password.length >= 6) updateFields.password = password;

        const updatedUser = await User.updateProfile(userId, updateFields);

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({ user: updatedUser });
    } catch (err) {
        console.log("Update failed:", err.message);

        // Send 403 if guest tried to update password
        if (err.message.includes("Guests are not allowed")) {
            return res.status(403).json({ error: err.message });
        }

        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
