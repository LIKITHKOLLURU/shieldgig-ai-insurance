const express = require('express');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Claim = require('../models/Claim');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('currentPlan')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, location, workType, platforms } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (workType) updateData.workType = workType;
    if (platforms) updateData.platforms = platforms;
    
    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address,
        city: location.city,
        state: location.state
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).populate('currentPlan').select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user subscriptions
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user claims
router.get('/claims', auth, async (req, res) => {
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

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('currentPlan')
      .select('-password');

    const activeSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('plan');

    const recentClaims = await Claim.find({ user: req.user.id })
      .populate('plan')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalClaims: await Claim.countDocuments({ user: req.user.id }),
      approvedClaims: await Claim.countDocuments({ 
        user: req.user.id, 
        status: 'approved' 
      }),
      totalPayouts: await Claim.aggregate([
        { $match: { user: req.user._id, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$claimAmount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json({
      user,
      activeSubscription,
      recentClaims,
      stats
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
