const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

const registerAdmin = async (req, res) => {
  try {
    
    const { name, email, password, setupCode } = req.body;

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password ||
      typeof setupCode !== 'string' || !setupCode
    ) {
      return res.status(400).json({ message: 'Name, email, password, and setup code are required' });
    }

    if (!name || !email || !password || !setupCode) {
      return res.status(400).json({ message: 'Name, email, password, and setup code are required' });
    }

    if (setupCode !== process.env.ADMIN_SETUP_CODE) {
      return res.status(403).json({ message: 'Invalid setup code' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'An admin with that email already exists' });

    const admin = await Admin.create({ name, email, password });
    const token = signToken(admin._id, 'admin');
    res.status(201).json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      const match = await admin.comparePassword(password);
      if (!match) return res.status(401).json({ message: 'Invalid email or password' });
      const token = signToken(admin._id, 'admin');
      return res.json({
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
      });
    }

    const member = await User.findOne({ email });
    if (member) {
      const match = await member.comparePassword(password);
      if (!match) return res.status(401).json({ message: 'Invalid email or password' });
      const token = signToken(member._id, 'member');
      return res.json({
        token,
        user: {
          id: member._id,
          name: member.name,
          email: member.email,
          role: 'member',
          projectId: member.project,
          jobRole: member.role
        }
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAdmin, login };