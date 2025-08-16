const router = require("express").Router();
const statsController = require("../controllers/statsController");
const requireAuth = require("../middleware/requireAuth");

router.get("/leaderboard", requireAuth, statsController.getLeaderboard);
router.get("/:userId", requireAuth, statsController.getUserStatsById);

module.exports = router;
