const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const generateToken = (user, companyName = null) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      companyName,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const sendErrorResponse = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendErrorResponse(res, 400, 'Email already exists');
    }

    const allowedRoles = ['Employer', 'Candidate'];
    if (!allowedRoles.includes(role)) {
      return sendErrorResponse(res, 400, 'Invalid role specified');
    }

    let company = null;
    if (role === 'Employer') {
      if (!companyName) {
        return sendErrorResponse(res, 400, 'Company name is required for employers');
      }

      const normalizedCompanyName = companyName.trim();

      company = await Company.findOne({ name: normalizedCompanyName });
      if (!company) {
        company = await Company.create({ name: normalizedCompanyName });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      companyId: company ? company._id : undefined,
    });

    try {
      await Profile.create({ user: user._id });
    } catch (profileErr) {
      console.error('❌ Error creating profile:', profileErr);
    }

    const token = generateToken(user, company ? company.name : null);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company: company ? company.name : null,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Error in register:', err);
    return sendErrorResponse(res, 500, 'Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).populate('companyId');
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendErrorResponse(res, 400, 'Invalid credentials');
    }

    const token = generateToken(user, user.companyId?.name || null);

    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, role: user.role, company: user.companyId?.name || null },
      token,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('❌ Error in login:', err);
    return sendErrorResponse(res, 500, 'Server error');
  }
};
