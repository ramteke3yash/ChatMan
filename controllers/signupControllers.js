const path = require("path");
const rootDir = require("../utils/root-dir");
const User = require("../models/userModel");
const { hash } = require("bcrypt");

exports.getSignupPage = (req, res) => {
  res.sendFile(path.join(rootDir, "views", "signup.html"));
};

exports.registerUser = async (req, res) => {
  try {
    // Extract name, email, and password from the request body
    const { name, email, password } = req.body;

    // Check if a user already exists with the provided email
    const oldUser = await User.findOne({ where: { email } });

    // If a user with the email already exists, return an error message
    if (oldUser) {
      return res
        .status(200)
        .json({ message: "A user already exists with this email!" });
    }

    // Hash the provided password
    const hashedPW = await hash(password + "", 10);

    // Create a new user in the database
    const user = await User.create({ name, email, password: hashedPW });

    // If user creation is successful, send a success message and redirect to login page
    if (user) {
      res.status(201).json({ message: "Success", redirect: "/login" });
    } else {
      // If user creation fails, return an error message
      res.status(500).json({ message: "Something went wrong!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
