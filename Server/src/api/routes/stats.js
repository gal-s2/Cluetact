const router = require("express").Router();
const statsController = require("../controllers/statsController");

router.get("/leaderboard", statsController.getLeaderboard);
router.get("/:userId", statsController.getUserStatsById);

module.exports = router;
