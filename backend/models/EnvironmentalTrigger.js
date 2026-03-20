const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['rain', 'heat', 'aqi', 'curfew']
  },
  threshold: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    city: String,
    state: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  affectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  claimsGenerated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  source: {
    type: String,
    required: true
  },
  rawData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Index for location-based queries
triggerSchema.index({ 'location.coordinates': '2dsphere' });
// Index for active triggers
triggerSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('EnvironmentalTrigger', triggerSchema);
