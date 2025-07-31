const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/guest", authController.guest);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.google);
router.post("/logout", authController.logout);
router.post("/disconnect", authController.disconnect);

module.exports = router;
