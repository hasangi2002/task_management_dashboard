const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const allUsers = await User.find().sort({ createdAt: -1 });
    const users = allUsers.filter(u => String(u.project) === req.params.projectId);
    const sanitized = users.map(u => {
      const obj = u.toObject ? u.toObject() : { ...u };
      delete obj.password;
      return obj;
    });
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add team members' });
    }
    if (!req.body.password) {
      return res.status(400).json({ message: 'A password is required to create a team member login' });
    }
    const user = await User.create({ ...req.body, project: req.params.projectId });
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can edit team members' });
    }
    const body = { ...req.body };
    if (!body.password) delete body.password;

    const user = await User.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove team members' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lets a logged-in member update their OWN name/phone/photo/password. No admin required.
const updateMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'This endpoint is for team member accounts only' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });

    const { name, phone, profilePicture, password } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (password) user.password = password; // hashed by the pre-save hook

    await user.save();
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, updateMyProfile };