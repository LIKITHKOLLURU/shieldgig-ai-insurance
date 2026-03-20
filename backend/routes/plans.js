const express = require('express');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all available plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ premium: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // Weekly subscription

    const subscription = new Subscription({
      user: req.user.id,
      plan: planId,
      startDate,
      endDate,
      premium: plan.premium,
      paymentStatus: 'paid', // Simulating payment
      paymentReference: 'SIM_' + Date.now()
    });

    await subscription.save();

    // Update user's current plan
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      currentPlan: planId,
      planExpiry: endDate
    });

    await subscription.populate('plan');

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    // Update user's current plan
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      currentPlan: null,
      planExpiry: null
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
