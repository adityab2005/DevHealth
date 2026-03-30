const express = require('express');
const router = express.Router();
const IntegrationConfig = require('../models/IntegrationConfig');
const { pollApis } = require('../jobs/apiPoller');
const { runAggregations } = require('../jobs/metricAggregator');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/sync', async (req, res) => {
  try {
    await pollApis();
    await runAggregations();
    res.json({ message: 'Sync and aggregation completed successfully' });
  } catch (error) {
    console.error('Error during manual sync:', error);
    res.status(500).json({ error: 'Manual sync failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) {
       return res.status(400).json({ error: 'User does not belong to a team' });
    }

    const config = await IntegrationConfig.findOne({ team_id });
    if (config) {
      res.json(config);
    } else {
      res.json({ team_id, github: {}, jira: {}, jenkins: {}, sonarcloud: {} });
    }
  } catch (error) {
    console.error('Error fetching integration config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) {
       return res.status(400).json({ error: 'User does not belong to a team. Create one first via Admin.' });
    }
    const { github, jira, jenkins, sonarcloud, permissions } = req.body;

    const updateData = { github, jira, jenkins, sonarcloud };
    if (permissions) updateData.permissions = permissions;

    const config = await IntegrationConfig.findOneAndUpdate(
      { team_id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ message: 'Configuration saved successfully', config });
  } catch (error) {
    console.error('Error saving integration config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

module.exports = router;