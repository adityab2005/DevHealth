const cron = require('node-cron');
const IntegrationConfig = require('../models/IntegrationConfig');
const { fetchGithubCommits } = require('../services/githubService');
const { fetchJiraIssues } = require('../services/jiraService');
const { fetchJenkinsBuilds } = require('../services/jenkinsService');
const { fetchSonarCloudMetrics } = require('../services/sonarcloudService');

let isPolling = false;

const pollApis = async () => {
  if (isPolling) {
    console.log('[ApiPoller] Skip run, already polling APIs...');
    return;
  }
  isPolling = true;

  try {
    console.log('[ApiPoller] Starting dynamic API polling cycle...');

    const configs = await IntegrationConfig.find({});
    if (configs.length === 0) {
        console.log('[ApiPoller] No integration configs found. Skipping.');
        return;
    }

    for (const config of configs) {
        const teamId = config.team_id;
        const projectTasks = [];

        if (config.github && config.github.token) {
            projectTasks.push(fetchGithubCommits(config.github, teamId));
        }

        if (config.jira && config.jira.token) {
            projectTasks.push(fetchJiraIssues(config.jira, teamId));
        }

        if (config.jenkins && config.jenkins.token) {
            projectTasks.push(fetchJenkinsBuilds(config.jenkins, teamId));
        }

        if (config.sonarcloud && config.sonarcloud.token) {
            projectTasks.push(fetchSonarCloudMetrics(config.sonarcloud, teamId));
        }

        if (projectTasks.length > 0) {
            await Promise.allSettled(projectTasks);
            config.last_synced = new Date();
            await config.save();
        }
    }

    console.log(`[ApiPoller] API polling cycle completed for ${configs.length} project(s).`);

  } catch (error) {
    console.error('[ApiPoller] API polling failed:', error);
  } finally {
    isPolling = false;
  }
};

const initApiPoller = () => {
  cron.schedule('*/5 * * * *', pollApis);
  setTimeout(pollApis, 10000);
};

module.exports = { initApiPoller, pollApis };
