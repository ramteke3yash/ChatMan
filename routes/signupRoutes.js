const express = require("express");
const signupControllers = require("../controllers/signupControllers");
const auth = require("../utils/auth");
const router = express.Router();

router.get("/", auth.isUnauthorised, signupControllers.getSignupPage);
router.post("/", auth.isUnauthorised, signupControllers.registerUser);

module.exports = router;
