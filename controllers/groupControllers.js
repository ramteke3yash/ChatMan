const path = require("path");
const rootDir = require("../utils/root-dir");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const { Op } = require("sequelize");

const createGroup = async (req, res) => {
  try {
    // Extract relevant details from the request body
    const { groupName, participants, admins } = req.body;
    const adminId = req.session.userId;
    if (!adminId || !groupName) throw new Error("Invalid request!");

    // Create a new group with the specified name
    const group = await Group.create({ name: groupName });

    // Add the admin user to the group as both a user and an admin
    await group.addUser(adminId);
    await group.addAdmin(adminId);

    // Add participants to the group
    for (const userId of participants) {
      await group.addUser(userId);
    }

    // Add admins to the group if they are also participants
    for (const adminId of admins) {
      if (participants.includes(adminId)) await group.addAdmin(adminId);
    }

    // Send JSON response indicating success
    res.status(201).json({
      message: "Group created successfully!",
      id: group.id,
      edit: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const addAdmin = async (req, res) => {
  try {
    // Extract groupId and adminsList from the request body
    const { groupId, adminsList } = req.body;
    const group = await Group.findByPk(groupId);

    // Iterate through the provided admin IDs and add them as admins to the group
    for (const adminId of adminsList) {
      const hasUser = await group.hasUser(adminId);
      if (hasUser) await group.addAdmin(adminId);
    }

    // Send JSON response indicating success
    res.status(201).json({ message: "Admins added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const removeAdmin = async (req, res) => {
  try {
    // Extract groupId and adminsList from the request body
    const { groupId, adminsList } = req.body;
    const group = await Group.findByPk(groupId);

    // Iterate through the provided admin IDs and remove them as admins from the group
    for (const adminId of adminsList) {
      const hasUser = await group.hasAdmin(adminId);
      if (hasUser) await group.removeAdmin(adminId);
    }

    // Send JSON response indicating success
    res.status(201).json({ message: "Admins removed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getGroups = async (req, res) => {
  try {
    // Extract userId from the session
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    // Retrieve groups associated with the current user
    const userGroups = await user.getGroups({
      raw: true,
      joinTableAttributes: [],
    });

    // Send JSON response with userGroups data
    res.status(201).json({ userGroups });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Retrieve all users except the current user
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      attributes: ["name", "email", "id"],
    });

    // Send JSON response with users data
    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const isAdmin = async (req, res) => {
  try {
    // Extract groupId and userId from the request headers
    const groupId = req.get("groupId");
    const userId = req.session.userId;

    // Find the group by its primary key
    const group = await Group.findByPk(groupId);

    // Check if the current user is an admin of the group
    const admin = await group.hasAdmin(userId);

    // Send JSON response with isAdmin data
    res.status(200).json({ isAdmin: admin });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getCurrentParticipants = async (req, res) => {
  try {
    // Extract groupId from the request headers
    const groupId = req.get("groupId");

    // Find the group by its primary key
    const group = await Group.findByPk(groupId);

    // Retrieve participants excluding the current user
    const participants = await group.getUsers({
      attributes: ["id", "name", "email"],
      raw: true,
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      joinTableAttributes: [],
    });

    // Retrieve admins excluding the current user
    const admins = await group.getAdmin({
      attributes: ["id", "name", "email"],
      raw: true,
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      joinTableAttributes: [],
    });

    // Retrieve all users
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: req.session.userId,
        },
      },
      attributes: ["name", "email", "id"],
    });

    // Send JSON response with participants, admins, and users data
    res.status(200).json({ participants, admins, users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateGroup = async (req, res) => {
  try {
    // Extract details from the request body
    const { groupId, groupName, participants, admins } = req.body;
    const adminId = req.session.userId;
    if (!adminId || !groupName) throw new Error("Invalid request!");

    // Find the group by its primary key
    const group = await Group.findByPk(groupId);

    // Update group name
    group.name = groupName;

    // Clear existing users and admins
    await group.setUsers([]);
    await group.setAdmin([]);

    // Add admin as both user and admin
    await group.addUser(adminId);
    await group.addAdmin(adminId);

    // Add participants to the group
    for (const userId of participants) {
      await group.addUser(userId);
    }

    // Add admins to the group if they are also participants
    for (const adminId of admins) {
      if (participants.includes(adminId)) await group.addAdmin(adminId);
    }

    // Save the updated group
    group.save();

    // Send JSON response indicating success
    res.status(201).json({
      message: "Group updated successfully!",
      id: group.id,
      edit: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    // Extract groupId from the request body
    const { groupId } = req.body;

    // Find the group by its primary key and delete it
    const group = await Group.findByPk(groupId);
    await group.destroy();

    // Send JSON response indicating success
    res.status(201).json({ message: "Deletion successful" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// Export all functions as module.exports
module.exports = {
  createGroup,
  addAdmin,
  removeAdmin,
  getGroups,
  getAllUsers,
  isAdmin,
  getCurrentParticipants,
  updateGroup,
  deleteGroup,
};
