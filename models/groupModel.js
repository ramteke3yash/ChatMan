const db = require("../utils/db");
const Sequelize = require("sequelize");

const Group = db.define("group", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

module.exports = Group;
