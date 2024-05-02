const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const sharedSession = require("express-socket.io-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const { Op } = require("sequelize");
const cron = require("node-cron");
const db = require("./utils/db");
const Chat = require("./models/chatModel");
const scheduleChatArchivalCronJob = require("./utils/cronJob");
const socketRoutes = require("./routes/socketRoutes");
const app = express();

const server = http.createServer(app);
const io = socketIo(server);

module.exports = { io };

require("dotenv").config();

//express-session middleware
const sessionMiddleware = session({
  secret: "sekretcey987123",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
});

app.use(sessionMiddleware);

// Use shared session middleware for Socket.io
io.use(
  sharedSession(sessionMiddleware, {
    autoSave: true,
  })
);

// Static file middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// CORS middleware
app.use(
  cors({
    origin: ["http://127.0.0.1:3000", "http://127.0.0.1:5501", "*"],
    credentials: true,
  })
);

// body parser middleware
app.use(bodyParser.json());

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  const userId = socket.handshake.session.userId;
  console.log(userId);

  if (!userId) {
    console.error("User ID not found in session. Disconnecting...");
    socket.disconnect();
    return;
  }
  // Retrieve username from the session
  const username = socket.handshake.session.username;

  // Set the user property on the socket object with the username
  socket.user = { id: userId, name: username };
  socketRoutes(io, socket);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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
  const ArchivedChat = require("./models/archivedchatModel");

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

  server.listen(3000, () => {
    console.log("Server started");
  });

  //set up cron job
  scheduleChatArchivalCronJob();
})();
