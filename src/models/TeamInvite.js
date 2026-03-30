const mongoose = require('mongoose');

const teamInviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ['manager', 'developer'],
    default: 'developer'
  },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  invited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  invite_token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true }
}, { timestamps: true });

// Prevent duplicate pending invites for the same email and team
teamInviteSchema.index({ email: 1, team_id: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('TeamInvite', teamInviteSchema);