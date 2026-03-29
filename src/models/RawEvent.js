const mongoose = require('mongoose');

const rawEventSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    enum: ['github', 'jira', 'jenkins'],
    index: true
  },
  source_id: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate webhook events
    index: true
  },
  event_type: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
    index: true
  },
  retry_count: {
    type: Number,
    default: 0
  },
  error_message: {
    type: String,
    default: null
  },
  processed_at: {
    type: Date,
    default: null
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const RawEvent = mongoose.model('RawEvent', rawEventSchema);

module.exports = RawEvent;
