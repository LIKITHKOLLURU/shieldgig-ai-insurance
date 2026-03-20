const express = require('express');
const User = require('../models/User');
const Claim = require('../models/Claim');
const Subscription = require('../models/Subscription');
const EnvironmentalTrigger = require('../models/EnvironmentalTrigger');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments({ role: 'worker' }),
      activeUsers: await User.countDocuments({ 
        role: 'worker', 
        isActive: true 
      }),
      totalClaims: await Claim.countDocuments(),
      pendingClaims: await Claim.countDocuments({ status: 'pending' }),
      approvedClaims: await Claim.countDocuments({ status: 'approved' }),
      rejectedClaims: await Claim.countDocuments({ status: 'rejected' }),
      totalPayouts: await Claim.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$claimAmount' } } }
      ]).then(result => result[0]?.total || 0),
      activeSubscriptions: await Subscription.countDocuments({ 
        status: 'active',
        endDate: { $gt: new Date() }
      }),
      fraudClaims: await Claim.countDocuments({ isFraudulent: true })
    };

    // Get recent claims
    const recentClaims = await Claim.find()
      .populate('user', 'name email')
      .populate('plan', 'name premium')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get active triggers
    const activeTriggers = await EnvironmentalTrigger.find({ 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      stats,
      recentClaims,
      activeTriggers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = { role: 'worker' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('currentPlan')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims with filters
router.get('/claims', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (user) query.user = user;

    const claims = await Claim.find(query)
      .populate('user', 'name email')
      .populate('plan', 'name premium')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Claim.countDocuments(query);

    res.json({
      claims,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update claim status
router.put('/claims/:id', adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    if (notes) claim.notes = notes;
    
    if (status === 'approved') {
      claim.processedAt = new Date();
      claim.payoutReference = 'PAY_' + Date.now();
      
      // Update user stats
      await User.findByIdAndUpdate(claim.user, {
        $inc: { 
          totalClaims: 1, 
          totalPayouts: claim.claimAmount 
        }
      });
    }

    await claim.save();
    await claim.populate('user', 'name email');
    await claim.populate('plan', 'name premium');

    res.json(claim);
  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fraud alerts
router.get('/fraud-alerts', adminAuth, async (req, res) => {
  try {
    const fraudClaims = await Claim.find({
      $or: [
        { isFraudulent: true },
        { fraudFlags: { $exists: true, $ne: [] } }
      ]
    })
      .populate('user', 'name email')
      .populate('plan', 'name premium')
      .sort({ createdAt: -1 });

    // Get suspicious users (multiple claims in short time)
    const suspiciousUsers = await Claim.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$user',
          claimCount: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' }
        }
      },
      {
        $match: { claimCount: { $gt: 3 } }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);

    res.json({
      fraudClaims,
      suspiciousUsers
    });
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
