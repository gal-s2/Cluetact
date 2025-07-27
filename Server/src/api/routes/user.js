const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const userController = require("../controllers/userController");

router.patch("/update-profile", requireAuth, userController.updateProfile);

module.exports = router;
