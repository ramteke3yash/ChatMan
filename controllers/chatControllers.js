require("dotenv").config();
const path = require("path");
const S3Service = require("../services/S3services");
const rootDir = require("../utils/root-dir");
const { Op } = require("sequelize");
const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const { io } = require("../app");

exports.getActiveUsers = async (req, res) => {
  try {
    // Extract groupId from the request header
    const groupId = req.get("groupId");

    // Find the group by its primary key
    const group = await Group.findByPk(parseInt(groupId));
    if (!group) throw new Error();

    // Retrieve users excluding the current user
    const users = await group.getUsers({
      raw: true,
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      attributes: ["name", "email", "id"],
      joinTableAttributes: [],
    });

    // Retrieve admins excluding the current user
    const admins = await group.getAdmin({
      raw: true,
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      attributes: ["name", "email", "id"],
      joinTableAttributes: [],
    });

    // Send JSON response with users and admins data
    res.json({ users, admins });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.getChatPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "chat.html"));
};

exports.saveMessage = async (req, res) => {
  try {
    // Extract necessary data from the request
    const { groupId } = req.body;
    let imageUrl = null;

    // If a file is attached, read it and upload it to AWS S3
    if (req.file) {
      const imageBuffer = req.file.buffer;
      const filename = `uploads/${Date.now()}_${req.file.originalname}`;

      imageUrl = await S3Service.uploadToS3(imageBuffer, filename);
    } else {
      // Handle case where no file is attached (if needed)
      console.log("File not exists");
    }

    // Create a new chat entry in the database
    const chat = await Chat.create({
      userId: req.session.userId,
      groupId,
      url: imageUrl,
    });

    // Send JSON response indicating success
    res.status(201).json({ message: "success", imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
