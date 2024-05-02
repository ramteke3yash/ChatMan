const path = require("path");
const S3Service = require("../services/S3services");
const rootDir = require("../utils/root-dir");
const { Op } = require("sequelize");
const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const { io } = require("../app");

module.exports = (io, socket) => {
  console.log(
    `User ${socket.user.name} is connected to the Socket.IO instance`
  );

  const addMessage = async (data, cb) => {
    try {
      const groupId = data.groupId;
      const message = data.message;

      const group = await Group.findByPk(groupId);
      const user = await User.findByPk(socket.user.id);

      console.log("Group:", group);
      //   console.log("User:", user);
      if (!group || !user) {
        throw new Error("Group or user not found");
      }

      // Create a message using the Chat model
      const chat = await Chat.create({
        userId: user.id,
        groupId: group.id,
        message: message,
      });

      // Emit the new message to Socket.io clients in the same group
      io.to(groupId).emit("message:recieve-message", {
        text: data.message,
        name: user.name,
        createdAt: chat.createdAt,
        userId: user.id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  socket.on("join-room", async (groupId, cb) => {
    try {
      console.log(`User ${socket.user.name} joined room ${groupId}`);
      console.log("this is gID->", groupId);

      // Check if the group ID is 0 (dummy group) and handle it accordingly
      if (groupId === 0) {
        // Handle dummy group scenario (if needed)
        // For example, you can simply return from here without any database query
        return;
      }

      const group = await Group.findByPk(groupId);
      //   const group = await Group.findByPk({ where: { id: group.id } });

      const user = await group.getUsers({ where: { id: socket.user.id } });

      // Here, directly query messages associated with the group through the Chat model
      const messages = await Chat.findAll({
        where: { groupId: groupId },
        include: [{ model: User }],
      });

      const users = await group.getUsers({
        attributes: {
          exclude: ["password"],
        },
      });

      socket.join(groupId);

      await cb(messages, users);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("message:send-message", addMessage);

  socket.on("file:send-file-data", (data, groupId) => {
    socket.to(groupId).emit("file:recieve-file", data, socket.user.name);
  });
};
