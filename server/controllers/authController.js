const User = require('../models/User');
const Profile = require('../models/Profile'); // make sure you have this model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

exports.register = async (req, res) => {
  try {
    console.log('📥 Request body:', req.body);

    const { name, email, password, role, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    let company = null;

    if (role === 'Employer') {
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required for employers' });
      }

      company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({ name: companyName });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyId: company ? company._id : undefined
    });

    // Optional: Create profile
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
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company: company ? company.name : null
      },
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