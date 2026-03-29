require('dotenv').config();

module.exports = {
  github: {
    token: process.env.GITHUB_TOKEN,
    repositories: [
      { owner: 'sample-owner', repo: 'sample-repo' },
      // Add more repos as needed
    ]
  },
  jira: {
    domain: process.env.JIRA_DOMAIN, // e.g. domain.atlassian.net
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN,
    projects: ['PROJ', 'DEV']
  },
  jenkins: {
    baseUrl: process.env.JENKINS_BASE_URL,
    username: process.env.JENKINS_USER,
    token: process.env.JENKINS_TOKEN,
    jobs: ['Build-Job-1', 'Build-Job-2']
  }
};