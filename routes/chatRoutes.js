const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const auth = require("../utils/auth");
const chatControllers = require("../controllers/chatControllers");

router.get("/", auth.isAuthorised, chatControllers.getChatPage);

router.get("/activeUsers", auth.isAuthorised, chatControllers.getActiveUsers);

// router.get("/all", auth.isAuthorised, chatControllers.getMessages);

router.post(
  "/saveMessage",
  auth.isAuthorised,
  upload.single("file"),
  chatControllers.saveMessage
);

module.exports = router;
