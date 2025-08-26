const express = require("express");
const router = express.Router();
const { getTodaysWord } = require("../../utils/dailyWords");

// GET /api/daily-word - Get today's word of the day
router.get("/", (req, res) => {
    try {
        const wordData = getTodaysWord();
        res.json({
            success: true,
            data: wordData,
        });
    } catch (error) {
        console.error("Error fetching daily word:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily word",
        });
    }
});

module.exports = router;
