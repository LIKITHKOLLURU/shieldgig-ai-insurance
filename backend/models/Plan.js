const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Premium']
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  premium: {
    type: Number,
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    default: 'weekly'
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
