const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Admin only: create a team
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.create({
      name,
      created_by: req.user.id,
      members: [req.user.id]
    });
    
    // Assign creator to team
    await User.findByIdAndUpdate(req.user.id, { team_id: team._id });
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin only: Get all teams
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Manager: Add a user to a team
router.post('/:teamId/members', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { userId } = req.body;
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    await User.findByIdAndUpdate(userId, { team_id: teamId });
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;