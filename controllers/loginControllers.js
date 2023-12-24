const path = require("path");
const rootDir = require("../util/root-dir");
const User = require("../models/userModel");
const { compare } = require("bcrypt");

const activeUsers = {};

exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "login.html"));
};

exports.loginUser = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Find the user by email in the database
    const user = await User.findOne({ where: { email } });

    // If the user does not exist, return an invalid credentials message
    if (!user) {
      return res.status(200).json({ message: "Invalid credentials!" });
    }

    // Compare the provided password with the hashed password in the database
    const status = await compare(password + "", user.password + "");

    if (status) {
      req.session.userId = user.id;
      req.session.user = user;
      req.session.validated = true;

      activeUsers[user.id] = [user.name, email];

      return res.status(201).json({ redirect: "/chat" });
    } else {
      console.log(status, "\n\n");
      return res.status(200).json({ message: "Invalid credentials!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.logoutUser = (req, res) => {
  delete activeUsers[req.session.userId];
  req.session.destroy();
  res.redirect("/login");
};

exports.activeUsers = activeUsers;
