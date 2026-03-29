const express = require('express');
const router = express.Router();
const RawEvent = require('../models/RawEvent');

// --- POST /api/v1/webhooks/github ---
router.post('/github', async (req, res) => {
  try {
    const payload = req.body;
    
    // Extract top-level identification fields from headers or body
    const event_type = req.headers['x-github-event'] || payload?.action || 'unknown';
    const source_id = req.headers['x-github-delivery'] || payload?.id || `github_${Date.now()}`;
    
    const newEvent = new RawEvent({
      source: 'github',
      source_id: String(source_id),
      event_type: String(event_type),
      payload
    });
    
    await newEvent.save();
    res.status(202).json({ message: 'GitHub webhook received and queued for processing.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Webhook already processed.' });
    }
    console.error('Error saving GitHub webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- POST /api/v1/webhooks/jira ---
router.post('/jira', async (req, res) => {
  try {
    // Destructure out the top-level webhook metadata while keeping the rest as payload
    const { webhookEvent, timestamp, ...payload } = req.body;
    
    const event_type = webhookEvent || 'unknown';
    
    // Attempt to build a unique Jira event ID based on timestamp and issue ID
    const entityId = payload?.issue?.id || payload?.project?.id || 'unknown';
    const ts = timestamp || Date.now();
    const source_id = `jira_${entityId}_${ts}`;

    const newEvent = new RawEvent({
      source: 'jira',
      source_id: String(source_id),
      event_type: String(event_type),
      payload
    });
    
    await newEvent.save();
    res.status(202).json({ message: 'Jira webhook received and queued for processing.' });
  } catch (error) {
     if (error.code === 11000) {
      return res.status(200).json({ message: 'Webhook already processed.' });
    }
    console.error('Error saving Jira webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- POST /api/v1/webhooks/jenkins ---
router.post('/jenkins', async (req, res) => {
  try {
    const payload = req.body;
    
    // Standardize event_type mostly around build phases (e.g., 'STARTED', 'COMPLETED', 'FINALIZED')
    const buildPhase = payload?.build?.phase ? payload.build.phase.toLowerCase() : 'unknown';
    const event_type = `build_${buildPhase}`;
    
    // Combine job name and build number for uniqueness, or fallback to timestamp
    const jobName = payload?.name || 'unknown_job';
    const buildNumber = payload?.build?.number || Date.now();
    const source_id = `jenkins_${jobName}_${buildNumber}_${buildPhase}`;

    const newEvent = new RawEvent({
      source: 'jenkins',
      source_id: String(source_id),
      event_type: String(event_type),
      payload
    });
    
    await newEvent.save();
    res.status(202).json({ message: 'Jenkins webhook received and queued for processing.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Webhook already processed.' });
    }
    console.error('Error saving Jenkins webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
