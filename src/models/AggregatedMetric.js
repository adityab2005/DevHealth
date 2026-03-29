const mongoose = require('mongoose');

const aggregatedMetricSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
    index: true
  },
  metric_name: {
    type: String,
    required: true,
    enum: ['commit_frequency', 'build_success_rate', 'issues_opened', 'issues_closed'],
    index: true
  },
  value: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
    // Typically the "start" of the aggregation bucket (e.g., start of the day)
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Ensure we don't have duplicate metrics for the same project, metric, and time bucket
aggregatedMetricSchema.index({ project_id: 1, metric_name: 1, timestamp: 1 }, { unique: true });

const AggregatedMetric = mongoose.model('AggregatedMetric', aggregatedMetricSchema);

module.exports = AggregatedMetric;
