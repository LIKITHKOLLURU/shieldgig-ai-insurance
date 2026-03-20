const express = require('express');
const Claim = require('../models/Claim');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all claims for user
router.get('/', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user.id })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single claim
router.get('/:id', auth, async (req, res) => {
  try {
    const claim = await Claim.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('plan');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json(claim);
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create manual claim (for testing)
router.post('/', auth, async (req, res) => {
  try {
    const { triggerType, triggerValue, claimAmount, location } = req.body;

    // Check if user has active subscription
    const Subscription = require('../models/Subscription');
    const activeSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!activeSubscription) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    const claim = new Claim({
      user: req.user.id,
      plan: activeSubscription.plan,
      triggerType,
      triggerValue,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address
      },
      eventData: {
        timestamp: new Date(),
        weather: req.body.weatherData || {},
        aqi: req.body.aqiData || {}
      },
      claimAmount,
      status: 'pending'
    });

    await claim.save();
    await claim.populate('plan');

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
