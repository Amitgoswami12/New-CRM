const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 * Authenticate an admin user and issue JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid/Missing credentials.',
      errorMessage: error.message,
    });
  }

  try {
    // Get models
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');

    // Find admin by email
    const admin = await Admin.findOne({
      email: email,
      removed: false
    });

    // Check if admin exists
    if (!admin) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No account with this email has been registered.',
      });
    }

    // Check if admin is enabled
    if (!admin.enabled) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Your account is disabled, contact your account administrator',
      });
    }

    // Get admin password document
    const adminPassword = await AdminPassword.findOne({
      user: admin._id,
      removed: false
    });

    // Verify password using the method from your schema
    if (!adminPassword || !adminPassword.validPassword(adminPassword.salt, password)) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Invalid credentials',
      });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: admin._id,
        role: admin.role
      }
    };

    // Add session tracking if needed
    const sessionId = require('crypto').randomBytes(16).toString('hex');

    // Optional: Track logged in sessions
    adminPassword.loggedSessions.push(sessionId);
    await adminPassword.save();

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Return success with token
    return res.status(200).json({
      success: true,
      result: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      },
      message: 'Successfully logged in',
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Server error occurred',
      error: err
    });
  }
};

module.exports = loginAdmin;