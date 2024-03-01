const express = require("express");
const groupControllers = require("../controllers/groupControllers");
const auth = require("../utils/auth");
const router = express.Router();

router.post("/create", auth.isAuthorised, groupControllers.createGroup);

router.put("/update", auth.isAuthorised, groupControllers.updateGroup);
router.put("/delete", auth.isAuthorised, groupControllers.deleteGroup);

router.get("/all", auth.isAuthorised, groupControllers.getGroups);

router.get("/allUsers", auth.isAuthorised, groupControllers.getAllUsers);

router.get("/isAdmin", auth.isAuthorised, groupControllers.isAdmin);

router.get(
  "/currentUsers",
  auth.isAuthorised,
  groupControllers.getCurrentParticipants
);

module.exports = router;
