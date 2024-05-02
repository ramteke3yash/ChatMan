const express = require("express");
const loginControllers = require("../controllers/loginControllers");
const router = express.Router();
const auth = require("../utils/auth");

router.get("/", auth.isUnauthorised, loginControllers.getLoginPage);
router.post("/", auth.isUnauthorised, loginControllers.loginUser);
router.get("/logout", auth.isAuthorised, loginControllers.logoutUser);

module.exports = router;
