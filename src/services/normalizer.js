/**
 * Mappers to convert tool-specific webhooks into a standard NormalizedEvent format.
 */

const { GITHUB_TO_PROJECT, JIRA_TO_PROJECT, JENKINS_TO_PROJECT, DEFAULT_PROJECT } = require('../config/projectMap');

const normalizeGithubEvent = (raw) => {
  const { event_type, payload } = raw;
  let type = 'unknown';
  let status = 'unknown';
  let actor = payload.pusher?.name || payload.sender?.login || 'unknown';
  let timestamp = payload.repository?.updated_at || new Date();
  
  const rawRepoName = payload.repository?.name || 'unknown_repo';
  const project_id = GITHUB_TO_PROJECT[rawRepoName] || rawRepoName || DEFAULT_PROJECT;
  
  if (event_type === 'push') {
    type = 'commit';
    status = 'success';
    timestamp = payload.head_commit?.timestamp || timestamp;
  } else if (event_type === 'pull_request') {
    type = 'pull_request';
    status = payload.action; // e.g., 'opened', 'closed'
    if (payload.pull_request?.merged) status = 'merged';
    actor = payload.pull_request?.user?.login || actor;
    timestamp = payload.pull_request?.updated_at || timestamp;
  } else if (event_type === 'issues') {
    type = 'issue';
    status = payload.action;
    actor = payload.issue?.user?.login || actor;
    timestamp = payload.issue?.updated_at || timestamp;
  }

  return {
    source: 'github',
    project_id,
    type,
    status,
    actor,
    timestamp: new Date(timestamp),
    metadata: {
      repository: payload.repository?.full_name,
      url: payload.repository?.html_url
    }
  };
};

const normalizeJiraEvent = (raw) => {
  const { event_type, payload } = raw;
  const issue = payload.issue;
  
  let type = 'issue';
  let status = 'unknown';
  let actor = payload.user?.displayName || 'unknown';
  let timestamp = payload.timestamp || new Date();
  
  if (event_type.startsWith('jira:issue_')) {
    // mapped typically to 'created', 'updated', 'deleted'
    status = event_type.replace('jira:issue_', '');
  }

  const rawProjectKey = issue?.fields?.project?.key || 'unknown_jira_key';
  const project_id = JIRA_TO_PROJECT[rawProjectKey] || rawProjectKey || DEFAULT_PROJECT;

  return {
    source: 'jira',
    project_id,
    type,
    status,
    actor,
    timestamp: new Date(timestamp),
    metadata: {
      project_key: issue?.fields?.project?.key,
      issue_key: issue?.key,
      issue_type: issue?.fields?.issuetype?.name,
      priority: issue?.fields?.priority?.name
    }
  };
};

const normalizeJenkinsEvent = (raw) => {
  const { event_type, payload } = raw;
  
  let type = 'build';
  // Extracts status from event_type e.g. "build_completed" -> "completed", but override with real status if available
  let status = event_type.replace('build_', '').toLowerCase(); 
  
  if (payload.build && payload.build.phase === 'COMPLETED' && payload.build.status) {
    status = payload.build.status.toLowerCase();
  } else if (payload.build && payload.build.phase) {
    status = payload.build.phase.toLowerCase();
  }

  let actor = 'jenkins_system'; // Jenkins webhooks might not always have user triggered info
  let timestamp = payload.build?.timestamp ? new Date(payload.build.timestamp) : new Date(); // Use provided time or fallback
  
  const rawJobName = payload.name || 'unknown_job';
  const project_id = JENKINS_TO_PROJECT[rawJobName] || rawJobName || DEFAULT_PROJECT;

  return {
    source: 'jenkins',
    project_id,
    type,
    status,
    actor,
    timestamp,
    metadata: {
      job_name: payload.name,
      build_number: payload.build?.number,
      build_url: payload.build?.full_url,
      phase: payload.build?.phase
    }
  };
};

/**
 * Main normalization distributor
 */
const normalize = (rawEvent) => {
  switch (rawEvent.source) {
    case 'github':
      return normalizeGithubEvent(rawEvent);
    case 'jira':
      return normalizeJiraEvent(rawEvent);
    case 'jenkins':
      return normalizeJenkinsEvent(rawEvent);
    default:
      throw new Error(`Unknown source: ${rawEvent.source}`);
  }
};

module.exports = { normalize };
