// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Add debugging at the top of the file
console.log('JWT_SECRET value:', process.env.JWT_SECRET);
console.log('Environment variables:', process.env);

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1); // Exit the application if JWT_SECRET is not set
}

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('Attempting login for email:', email);
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: 'Invalid role for this user.' });
    }

    // Double check JWT_SECRET availability
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not available');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, role, name, gender, dob, contactDetails } = req.body;
    
    console.log('Attempting registration for email:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const user = new User({
      email,
      password,
      role,
      name,
      gender,
      dob,
      contactDetails
    });
    await user.save();

    // Double check JWT_SECRET availability
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not available');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

module.exports = { login, register };