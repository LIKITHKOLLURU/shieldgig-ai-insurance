const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
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
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    }
  },
  workType: {
    type: String,
    enum: ['delivery', 'ride-sharing', 'other'],
    default: 'delivery'
  },
  platforms: [{
    type: String,
    enum: ['swiggy', 'zomato', 'zepto', 'uber', 'ola', 'other']
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  currentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  planExpiry: {
    type: Date
  },
  totalClaims: {
    type: Number,
    default: 0
  },
  totalPayouts: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['worker', 'admin'],
    default: 'worker'
  }
}, {
  timestamps: true
});

// Index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('User', userSchema);
