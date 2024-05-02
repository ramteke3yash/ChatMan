const db = require("../utils/db");
const Sequelize = require("sequelize");

const Chat = db.define("chat", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: Sequelize.STRING,
  url: Sequelize.STRING,
});

module.exports = Chat;
