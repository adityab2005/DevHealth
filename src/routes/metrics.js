const express = require('express');
const router = express.Router();
const AggregatedMetric = require('../models/AggregatedMetric');
const { protect } = require('../middleware/auth');

router.use(protect);

// --- GET /api/v1/metrics ---
router.get('/', async (req, res) => {
  try {
    const { metric_name, from, to } = req.query;
    
    // Always enforce the user's team payload
    const team_id = req.user.team_id;

    if (!team_id) {
       return res.status(403).json({ error: 'User does not belong to a team. Cannot fetch metrics.' });
    }

    const query = { team_id };

    if (metric_name) {
      if (metric_name.includes(',')) {
        query.metric_name = { $in: metric_name.split(',') };
      } else {
        query.metric_name = metric_name;
      }
    }

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // Sort by timestamp ascending for time-series visualization
    const metrics = await AggregatedMetric.find(query).sort({ timestamp: 1 });

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;