const Sequelize = require("sequelize");

const db = new Sequelize("CchatMan", "root", "lion", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = db;
