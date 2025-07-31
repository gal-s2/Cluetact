const router = require("express").Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");
const statsRoutes = require("./stats");

router.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/stats", statsRoutes);

module.exports = router;
