const db = require("../utils/db");
const Sequelize = require("sequelize");

const ArchivedChat = db.define("ArchivedChat", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: Sequelize.STRING,
  url: Sequelize.STRING,
});

module.exports = ArchivedChat;
