const mongoose = require('mongoose');

const normalizedEventSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    enum: ['github', 'jira', 'jenkins'],
    index: true
  },
  project_id: {
    type: String,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
    // e.g., 'commit', 'pull_request', 'issue', 'build'
  },
  status: {
    type: String,
    // e.g., 'success', 'failure', 'open', 'closed', 'merged'
  },
  actor: {
    type: String,
    required: true, // The user or system that triggered the event
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  raw_event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawEvent',
    required: true,
    unique: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // Specific standardized fields like repository name, issue key, build duration, etc.
  }
}, { timestamps: true });

const NormalizedEvent = mongoose.model('NormalizedEvent', normalizedEventSchema);

module.exports = NormalizedEvent;
