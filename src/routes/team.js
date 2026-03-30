const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TeamInvite = require('../models/TeamInvite');
const User = require('../models/User');
const Team = require('../models/Team');
const { protect, authorize } = require('../middleware/auth');

// POST /api/v1/team/invite -> Admin sends invite
router.post('/invite', protect, authorize('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!req.user.team_id) {
      return res.status(400).json({ error: 'You are not assigned to a team.' });
    }

    if (!['manager', 'developer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role for invitation.' });
    }

    // Check if user is already in the team
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.team_id && existingUser.team_id.toString() === req.user.team_id.toString()) {
      return res.status(400).json({ error: 'User is already in the team.' });
    }

    // Generate token
    const invite_token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // 7 days expiry

    // In a real app we'd upsert or check for existing pending invites
    // Here we just delete any existing pending for this email/team to keep it simple
    await TeamInvite.deleteMany({ email, team_id: req.user.team_id, status: 'pending' });

    const invite = await TeamInvite.create({
      email,
      role,
      team_id: req.user.team_id,
      invited_by: req.user.id,
      invite_token,
      expires_at
    });

    // In a real app, send an email here.
    // For now, we return the token in the response so the frontend can display it.
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/invite/${invite_token}`;
    
    res.status(201).json({ message: 'Invite created', inviteLink, invite_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/team/invite/:token -> Validate invite
router.get('/invite/:token', async (req, res) => {
  try {
    const invite = await TeamInvite.findOne({ 
      invite_token: req.params.token, 
      status: 'pending',
      expires_at: { $gt: new Date() }
    }).populate('team_id', 'name').populate('invited_by', 'name');

    if (!invite) {
      return res.status(400).json({ error: 'Invite is invalid or has expired.' });
    }

    const existingUser = await User.findOne({ email: invite.email });

    res.json({
      email: invite.email,
      team_name: invite.team_id.name,
      invited_by: invite.invited_by.name,
      role: invite.role,
      userExists: !!existingUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/team/invite/accept -> User accepts invite and joins team
router.post('/invite/accept', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const invite = await TeamInvite.findOne({ 
      invite_token: token, 
      status: 'pending',
      expires_at: { $gt: new Date() }
    });

    if (!invite) {
      return res.status(400).json({ error: 'Invite is invalid or has expired.' });
    }

    let user = await User.findOne({ email: invite.email });

    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required for new users.' });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        team_id: invite.team_id
      });
    } else {
      // Existing user: verify they are correctly authenticated
      let tokenValue;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        tokenValue = req.headers.authorization.split(' ')[1];
      }
      if (!tokenValue) {
        return res.status(401).json({ error: 'An account with this email exists. Please log in first to accept this invite.' });
      }
      try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.id !== user._id.toString()) {
           return res.status(401).json({ error: 'Logged in user does not match the invited email. Please log in with the correct account.' });
        }
      } catch (err) {
        console.error("JWT verify error manual:", err.message);
        return res.status(401).json({ error: 'Session invalid or expired. Please log in again.' });
      }
      // Existing user joins team
      user.team_id = invite.team_id;
      user.role = invite.role; // Upgrade/downgrade role to match invite
      await user.save();
    }

    // Update Team members list
    await Team.findByIdAndUpdate(invite.team_id, {
      $addToSet: { members: user._id }
    });

    invite.status = 'accepted';
    await invite.save();

    const signedToken = jwt.sign(
      { id: user._id, role: user.role, team_id: user.team_id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

    res.json({ message: 'Team joined successfully', token: signedToken });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/team/members -> Get all team members
router.get('/members', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    if (!req.user.team_id) {
      return res.status(400).json({ error: 'You are not assigned to a team.' });
    }

    const members = await User.find({ team_id: req.user.team_id })
      .select('-password')
      .sort({ role: 1, name: 1 });
      
    // Optionally fetch pending invites
    const pendingInvites = await TeamInvite.find({
      team_id: req.user.team_id,
      status: 'pending'
    }).select('email role createdAt expires_at invite_token');

    res.json({ members, pendingInvites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/team/member/:userId/role -> Change role (admin only)
router.patch('/member/:userId/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'manager', 'developer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    // Ensure they are modifying someone in their team
    const user = await User.findOne({ _id: req.params.userId, team_id: req.user.team_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found in your team.' });
    }
    
    // Prevent removing the last admin? Nice to have, let's just do basic update
    user.role = role;
    await user.save();

    res.json({ message: 'Role updated successfully', user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/team/member/:userId -> Remove member (admin only)
router.delete('/member/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, team_id: req.user.team_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found in your team.' });
    }

    if (user._id.toString() === req.user.id) {
       return res.status(400).json({ error: 'You cannot remove yourself.' });
    }

    user.team_id = null;
    user.role = 'developer'; // reset role just in case
    await user.save();

    await Team.findByIdAndUpdate(req.user.team_id, {
      $pull: { members: user._id }
    });

    res.json({ message: 'User removed from team.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/team/my-invites -> Get invites for current user email
router.get('/my-invites', protect, async (req, res) => {
  try {
    const userEmail = req.user.email; // wait, req.user holds id, role, team_id by default in auth.js? Let's check auth.js
    
    // We should probably fetch the user first
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const invites = await TeamInvite.find({ email: user.email, status: 'pending' })
      .populate('team_id', 'name')
      .sort({ createdAt: -1 });

    res.json({ invites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/team/invite/:token/decline -> Decline invite
router.post('/invite/:token/decline', protect, async (req, res) => {
  try {
    const invite = await TeamInvite.findOne({ invite_token: req.params.token, status: 'pending' });
    if (!invite) return res.status(404).json({ error: 'Invite not found or expired.' });

    const user = await User.findById(req.user.id);
    if (!user || user.email !== invite.email) {
       return res.status(403).json({ error: 'Unauthorized to decline this invite.' });
    }

    invite.status = 'expired';
    await invite.save();

    res.json({ message: 'Invite declined successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/team/invite/:id -> Cancel invite
router.delete('/invite/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const invite = await TeamInvite.findOneAndDelete({ _id: req.params.id, team_id: req.user.team_id });
        if (!invite) return res.status(404).json({ error: 'Invite not found.' });
        res.json({ message: 'Invite cancelled.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;