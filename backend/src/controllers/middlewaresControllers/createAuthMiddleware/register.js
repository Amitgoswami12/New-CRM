const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Register a new admin in the system
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerAdmin = async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
    // Check if admin already exists
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');

    let existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ msg: 'Admin with this email already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({
      email,
      name,
      surname: surname || '',
      enabled: true,
      role: 'owner'
    });

    // Save the admin first to get the ID
    const savedAdmin = await newAdmin.save();

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Create the password document
    const adminPassword = new AdminPassword({
      user: savedAdmin._id,
      salt: salt,
      password: bcrypt.hashSync(salt + password), // Using the method from your schema
      emailVerified: false,
      authType: 'email'
    });

    await adminPassword.save();

    // Create JWT payload
    const payload = {
      user: {
        id: savedAdmin._id,
        role: savedAdmin.role
      }
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role
      }
    });

  } catch (err) {
    console.error('Admin Registration Error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = registerAdmin;