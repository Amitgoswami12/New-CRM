const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, { userModel }) => {
  const { name, email, password } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new userModel({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    const payload = {
      user: { id: newUser._id, role: newUser.role || 'User' },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = register;
