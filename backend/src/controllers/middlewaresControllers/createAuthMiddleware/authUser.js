const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const register = async (req, res, { userModel }) => {
  const { name, email, password } = req.body;

  try {
    let existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create User
    const newUser = new userModel({
      name,
      email,
      role: 'Admin', // or 'User', as needed
    });

    const savedUser = await newUser.save();

    // Create salt and hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(salt + password, 10);

    // Get UserPasswordModel
    const UserPasswordModel = require('@/models/userPassword.model.js'); // update this path as per your project

    const newPasswordEntry = new UserPasswordModel({
      user: savedUser._id,
      salt,
      password: hashedPassword,
      loggedSessions: [],
    });

    await newPasswordEntry.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = register;
