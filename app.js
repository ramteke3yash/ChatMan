const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const { Op } = require("sequelize");
const db = require("./utils/db");
const scheduleChatArchivalCronJob = require("./utils/cronJob");

const app = express();

require("dotenv").config();

// CORS middleware
app.use(
  cors({
    origin: ["http://127.0.0.1:3000", "http://127.0.0.1:5501"],
    methods: ["GET", "POST"],
  })
);

// express-session middleware
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

// body parser middleware
app.use(bodyParser.json());

// Static file middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// Route handling
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");

app.get("/", signupRoutes);
app.use("/signup", signupRoutes);
app.use("/login", loginRoutes);
app.use("/chat", chatRoutes);
app.use("/group", groupRoutes);

// Database connection and model definitions
(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
  await db.sync();

  app.listen(3000, () => {
    console.log("server started");
  });

  //set up cron job
  scheduleChatArchivalCronJob();
})();
