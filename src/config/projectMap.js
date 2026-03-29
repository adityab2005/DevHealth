/**
 * Mapping configuration to route disparate tool identifiers to unified logical DevHealth projects.
 */
module.exports = {
  // Example mappings
  GITHUB_TO_TEAM: {
    'devhealth-backend': 'devhealth_core',
    'devhealth-frontend': 'devhealth_core',
    'ml-service': 'devhealth_ai'
  },
  JIRA_TO_TEAM: {
    'DEV': 'devhealth_core',
    'AI': 'devhealth_ai',
  },
  JENKINS_TO_TEAM: {
    'Deploy_DevHealth_Backend': 'devhealth_core',
    'Deploy_DevHealth_Frontend': 'devhealth_core',
    'Train_Risk_Model': 'devhealth_ai'
  },
  
  // Default fallback if no map is found
  DEFAULT_TEAM: 'unknown_project'
};
