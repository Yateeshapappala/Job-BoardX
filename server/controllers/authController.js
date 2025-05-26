const User = require('../models/User');
const Profile = require('../models/Profile'); // make sure you have this model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('📥 Request body:', req.body);

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Create a profile for the user (if applicable)
    try {
      await Profile.create({ user: user._id });
    } catch (profileErr) {
      console.error('❌ Error creating profile:', profileErr);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    console.error('❌ Error in register:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    console.error('❌ Error in login:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
