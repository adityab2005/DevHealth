const axios = require('axios');
const NormalizedEvent = require('../models/NormalizedEvent');

const fetchJiraIssues = async (config, projectId) => {
  if (!config || !config.domain || !config.email || !config.token) {
    console.warn(`[Jira Service] Missing JIRA credentials for project ${projectId}. Skipping fetch.`);
    return;
  }

  const authHeader = Buffer.from(`${config.email}:${config.token}`).toString('base64');
  const cleanDomain = config.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  let jql = `updated >= -1d ORDER BY updated DESC`;
  if (config.projects) {
     const projectKeys = config.projects.split(',').map(p => p.trim()).filter(Boolean);
     if (projectKeys.length > 0) {
         jql = `project IN (${projectKeys.join(',')}) AND updated >= -1d ORDER BY updated DESC`;
     }
  }

  try {
    const response = await axios.get(
      `https://${cleanDomain}/rest/api/3/search`,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        },
        params: {
          jql,
          maxResults: 50,
          fields: 'project,issuetype,status,reporter,updated,created,priority'
        }
      }
    );

    const issues = response.data.issues || [];
    console.log(`[Jira Service] Fetched ${issues.length} recently updated issues for project ${projectId}.`);

    const bulkOps = issues.map(issue => {
      const rawProjectKey = issue.fields?.project?.key || 'unknown_jira_key';
      const project_id = projectId;

      const statusName = issue.fields?.status?.name?.toLowerCase() || 'unknown';
      let mappedStatus = 'opened';
      if (['done', 'closed', 'resolved'].includes(statusName)) {
        mappedStatus = 'closed';
      } else if (['in progress', 'to do', 'open'].includes(statusName)) {  
        mappedStatus = 'opened';
      }

      return {
        updateOne: {
          filter: {
            'metadata.issue_id': issue.id,
            source: 'jira',
            status: mappedStatus
          },
          update: {
            $set: {
              source: 'jira',
              project_id,
              type: 'issue',
              status: mappedStatus,
              actor: issue.fields?.reporter?.displayName || 'unknown',     
              timestamp: new Date(issue.fields.updated),
              metadata: {
                project_key: rawProjectKey,
                issue_key: issue.key,
                issue_id: issue.id,
                issue_type: issue.fields?.issuetype?.name,
                priority: issue.fields?.priority?.name,
                url: `https://${cleanDomain}/browse/${issue.key}`
              }
            }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await NormalizedEvent.bulkWrite(bulkOps);
    }

  } catch (error) {
    console.error(`[Jira Service] Error fetching issues for project ${projectId}:`, error.message); 
  }
};

module.exports = { fetchJiraIssues };