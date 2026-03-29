const cron = require('node-cron');
const IntegrationConfig = require('../models/IntegrationConfig');
const { fetchGithubCommits } = require('../services/githubService');
const { fetchJiraIssues } = require('../services/jiraService');
const { fetchJenkinsBuilds } = require('../services/jenkinsService');

let isPolling = false;

const pollApis = async () => {
  if (isPolling) {
    console.log('[ApiPoller] Skip run, already polling APIs...');
    return;
  }
  isPolling = true;

  try {
    console.log('[ApiPoller] Starting dynamic API polling cycle...');

    // Fetch all integration configs from MongoDB
    const configs = await IntegrationConfig.find({});
    
    if (configs.length === 0) {
        console.log('[ApiPoller] No integration configs found. Skipping.');
        return;
    }

    const tasks = [];

    // Loop through each configuration and queue up the service calls
    for (const config of configs) {
        const projectId = config.project_id;
        
        if (config.github && config.github.token) {
            tasks.push(fetchGithubCommits(config.github, projectId));
        }
        
        if (config.jira && config.jira.token) {
            tasks.push(fetchJiraIssues(config.jira, projectId));
        }
        
        if (config.jenkins && config.jenkins.token) {
            tasks.push(fetchJenkinsBuilds(config.jenkins, projectId));
        }
    }

    if (tasks.length > 0) {
        await Promise.allSettled(tasks);
        console.log(`[ApiPoller] API polling cycle completed for ${configs.length} project(s).`);
    } else {
        console.log('[ApiPoller] No active integrations found in the configs.');
    }

  } catch (error) {
    console.error('[ApiPoller] API polling failed:', error);
  } finally {
    isPolling = false;
  }
};

const initApiPoller = () => {
  // Run API polling every 5 minutes
  cron.schedule('*/5 * * * *', pollApis);

  // Calculate initially on boot after a slight delay
  setTimeout(pollApis, 10000);
};

module.exports = { initApiPoller };