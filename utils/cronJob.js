const cron = require("node-cron");
const { Op } = require("sequelize");
const ArchivedChat = require("../models/archivedchatModel");
const Chat = require("../models/chatModel");

function scheduleChatArchivalCronJob() {
  cron.schedule("0 0 * * *", async () => {
    try {
      // Find and archive older messages
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const archivedChats = await Chat.findAll({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo,
          },
        },
      });

      await ArchivedChat.bulkCreate(
        archivedChats.map((message) => message.toJSON())
      );

      // Delete older messages from the Chat table
      await Chat.destroy({
        where: {
          createdAt: {
            [Op.lt]: oneDayAgo,
          },
        },
      });

      console.log("Chat messages archived and deleted successfully.");
    } catch (error) {
      console.error("Error archiving and deleting chat messages:", error);
    }
  });
}

module.exports = scheduleChatArchivalCronJob;
