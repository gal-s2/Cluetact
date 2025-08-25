const router = require("express").Router();
const express = require("express");

const authRoutes = require("./auth");
const userRoutes = require("./user");
const statsRoutes = require("./stats");
const dailyWordRoutes = require("./dailyWord");

router.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/stats", statsRoutes);
router.use("/daily-word", dailyWordRoutes);

module.exports = router;
