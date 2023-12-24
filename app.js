const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const db = require("./util/db");

const app = express();

app.use(
  session({
    secret: "sekretcey987123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "views")));

const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");

app.get("/", signupRoutes);
app.use("/signup", signupRoutes);
app.use("/login", loginRoutes);

(async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lion",
  });

  const User = require("./models/userModel");
  const Chat = require("./models/chatModel");
  const Group = require("./models/groupModel");

  User.hasMany(Chat);
  Chat.belongsTo(User);

  User.belongsToMany(Group, { through: "UserGroup", onDelete: "CASCADE" });
  Group.belongsToMany(User, { through: "UserGroup", onDelete: "CASCADE" });

  Group.belongsToMany(User, {
    as: "admin",
    through: "GroupAdmin",
    onDelete: "CASCADE",
  });

  Group.hasMany(Chat);
  Chat.belongsTo(Group);

  // await db.sync({ force: true });
  await db.sync({ force: true });
  app.listen(4000, () => {
    console.log("server started");
  });
})();
