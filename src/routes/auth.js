const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = (id, role, team_id) => {
  return jwt.sign({ id, role, team_id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, team_id, team_name } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'developer',
      team_id: team_id || null
    });

    // If an admin provides a team_name during registration, create the team
    if (role === 'admin' && team_name) {
      const team = await Team.create({
        name: team_name,
        created_by: user._id,
        members: [user._id]
      });
      // Update the user with the new team_id
      user.team_id = team._id;
      await user.save();
    }

    const token = signToken(user._id, user.role, user.team_id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user._id, user.role, user.team_id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;