const mongoose = require('mongoose');

const integrationConfigSchema = new mongoose.Schema({
  team_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  github: {
    token: { type: String, default: '' },
    repositories: { type: String, default: '' } // comma-separated list of "owner/repo"
  },
  jira: {
    domain: { type: String, default: '' },
    email: { type: String, default: '' },
    token: { type: String, default: '' },
    projects: { type: String, default: '' } // comma-separated
  },
  jenkins: {
    baseUrl: { type: String, default: '' },
    username: { type: String, default: '' },
    token: { type: String, default: '' },
    jobs: { type: String, default: '' } // comma-separated
  },
  permissions: {
    manager: { 
      type: [String], 
      default: ['commit_frequency', 'build_success', 'issue_resolution'] 
    },
    developer: { 
      type: [String], 
      default: ['commit_frequency', 'issue_resolution'] 
    }
  },
  last_synced: { type: Date, default: null }
}, { timestamps: true });

const IntegrationConfig = mongoose.model('IntegrationConfig', integrationConfigSchema);

module.exports = IntegrationConfig;