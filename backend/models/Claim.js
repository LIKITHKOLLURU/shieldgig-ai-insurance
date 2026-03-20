const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  triggerType: {
    type: String,
    required: true,
    enum: ['rain', 'heat', 'aqi', 'curfew']
  },
  triggerValue: {
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
    address: String
  },
  eventData: {
    weather: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      windSpeed: Number
    },
    aqi: {
      value: Number,
      category: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  claimAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  fraudFlags: [{
    type: String
  }],
  isFraudulent: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  payoutReference: String,
  notes: String
}, {
  timestamps: true
});

// Index for location-based queries
claimSchema.index({ 'location.coordinates': '2dsphere' });
// Index for user queries
claimSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
