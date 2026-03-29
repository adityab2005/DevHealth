const express = require('express');
const router = express.Router();
const IntegrationConfig = require('../models/IntegrationConfig');

// GET all configured projects
router.get('/', async (req, res) => {
  try {
    const configs = await IntegrationConfig.find({}, 'project_id');
    const projects = configs.map(c => c.project_id);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching integration projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET settings for a specific project
router.get('/:project_id', async (req, res) => {
  try {
    const config = await IntegrationConfig.findOne({ project_id: req.params.project_id });
    if (config) {
      res.json(config);
    } else {
      res.json({ project_id: req.params.project_id, github: {}, jira: {}, jenkins: {} });
    }
  } catch (error) {
    console.error('Error fetching integration config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// POST to upsert settings for a project
router.post('/', async (req, res) => {
  try {
    const { project_id, github, jira, jenkins } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const config = await IntegrationConfig.findOneAndUpdate(
      { project_id },
      { $set: { github, jira, jenkins } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Configuration saved successfully', config });
  } catch (error) {
    console.error('Error saving integration config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

module.exports = router;