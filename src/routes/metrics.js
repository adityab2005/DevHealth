const express = require('express');
const router = express.Router();
const AggregatedMetric = require('../models/AggregatedMetric');

// --- GET /api/v1/metrics ---
// Fetch aggregated metrics, filtered by project_id and metric_name, formatted for Grafana Infinity/JSON Plugin
router.get('/', async (req, res) => {
  try {
    const { project_id, metric_name, from, to } = req.query;

    const query = {};

    if (project_id) {
      query.project_id = project_id;
    }
    
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
