class FraudDetector {
  constructor() {
    this.suspiciousPatterns = {
      multipleClaims: { threshold: 3, timeWindow: 24 * 60 * 60 * 1000 }, // 3 claims in 24 hours
      rapidClaims: { threshold: 2, timeWindow: 60 * 60 * 1000 }, // 2 claims in 1 hour
      highFrequency: { threshold: 5, timeWindow: 7 * 24 * 60 * 60 * 1000 }, // 5 claims in 7 days
      locationAnomaly: { maxDistance: 50000 }, // 50km radius
      amountAnomaly: { multiplier: 3 } // 3x average claim amount
    };
  }

  // Analyze claim for fraud indicators
  async analyzeClaim(claim, user) {
    try {
      const fraudFlags = [];
      let isSuspicious = false;

      // Check 1: Multiple claims in short time
      const multipleClaimsFlag = await this.checkMultipleClaims(user._id);
      if (multipleClaimsFlag) {
        fraudFlags.push(multipleClaimsFlag);
        isSuspicious = true;
      }

      // Check 2: Location anomaly
      const locationFlag = this.checkLocationAnomaly(claim, user);
      if (locationFlag) {
        fraudFlags.push(locationFlag);
        isSuspicious = true;
      }

      // Check 3: Amount anomaly
      const amountFlag = await this.checkAmountAnomaly(claim, user._id);
      if (amountFlag) {
        fraudFlags.push(amountFlag);
        isSuspicious = true;
      }

      // Check 4: Trigger pattern analysis
      const patternFlag = await this.checkTriggerPattern(user._id, claim.triggerType);
      if (patternFlag) {
        fraudFlags.push(patternFlag);
        isSuspicious = true;
      }

      // Check 5: User behavior analysis
      const behaviorFlag = await this.checkUserBehavior(user);
      if (behaviorFlag) {
        fraudFlags.push(behaviorFlag);
        isSuspicious = true;
      }

      // Calculate fraud risk score
      const riskScore = this.calculateRiskScore(fraudFlags, user);

      return {
        isSuspicious,
        flags: fraudFlags,
        riskScore,
        recommendations: this.getRecommendations(fraudFlags)
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        isSuspicious: false,
        flags: ['detection_error'],
        riskScore: 0,
        recommendations: ['manual_review']
      };
    }
  }

  // Check for multiple claims in short time period
  async checkMultipleClaims(userId) {
    try {
      const Claim = require('../models/Claim');
      
      const now = new Date();
      const dayAgo = new Date(now.getTime() - this.suspiciousPatterns.multipleClaims.timeWindow);
      
      const recentClaims = await Claim.countDocuments({
        user: userId,
        createdAt: { $gte: dayAgo }
      });

      if (recentClaims >= this.suspiciousPatterns.multipleClaims.threshold) {
        return `multiple_claims_${recentClaims}_in_24h`;
      }

      // Check for rapid claims (within 1 hour)
      const hourAgo = new Date(now.getTime() - this.suspiciousPatterns.rapidClaims.timeWindow);
      const rapidClaims = await Claim.countDocuments({
        user: userId,
        createdAt: { $gte: hourAgo }
      });

      if (rapidClaims >= this.suspiciousPatterns.rapidClaims.threshold) {
        return `rapid_claims_${rapidClaims}_in_1h`;
      }

      return null;
    } catch (error) {
      console.error('Error checking multiple claims:', error);
      return null;
    }
  }

  // Check for location anomalies
  checkLocationAnomaly(claim, user) {
    try {
      if (!user.location || !claim.location) {
        return 'missing_location_data';
      }

      // Calculate distance between user's registered location and claim location
      const distance = this.calculateDistance(
        user.location.coordinates,
        claim.location.coordinates
      );

      if (distance > this.suspiciousPatterns.locationAnomaly.maxDistance) {
        return `location_anomaly_${Math.round(distance / 1000)}km`;
      }

      return null;
    } catch (error) {
      console.error('Error checking location anomaly:', error);
      return null;
    }
  }

  // Check for amount anomalies
  async checkAmountAnomaly(claim, userId) {
    try {
      const Claim = require('../models/Claim');
      
      // Get user's average claim amount
      const avgClaim = await Claim.aggregate([
        { $match: { user: userId, status: 'approved' } },
        { $group: { _id: null, avgAmount: { $avg: '$claimAmount' } } }
      ]);

      const averageAmount = avgClaim[0]?.avgAmount || claim.claimAmount;
      
      if (claim.claimAmount > averageAmount * this.suspiciousPatterns.amountAnomaly.multiplier) {
        return `amount_anomaly_${Math.round(claim.claimAmount / averageAmount)}x_average`;
      }

      return null;
    } catch (error) {
      console.error('Error checking amount anomaly:', error);
      return null;
    }
  }

  // Check trigger patterns for suspicious behavior
  async checkTriggerPattern(userId, currentTriggerType) {
    try {
      const Claim = require('../models/Claim');
      
      // Get user's claim history
      const claims = await Claim.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);

      if (claims.length < 3) return null;

      // Check for repetitive pattern
      const triggerTypes = claims.map(c => c.triggerType);
      const sameTypeCount = triggerTypes.filter(t => t === currentTriggerType).length;
      
      if (sameTypeCount >= 5) {
        return `repetitive_trigger_${currentTriggerType}`;
      }

      // Check for alternating pattern (possible gaming)
      const uniqueTypes = [...new Set(triggerTypes)];
      if (uniqueTypes.length >= 4 && claims.length >= 4) {
        return 'multiple_trigger_types_pattern';
      }

      return null;
    } catch (error) {
      console.error('Error checking trigger pattern:', error);
      return null;
    }
  }

  // Check user behavior patterns
  async checkUserBehavior(user) {
    try {
      const flags = [];

      // New user with immediate claims
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      if (accountAge < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
        const Claim = require('../models/Claim');
        const claimCount = await Claim.countDocuments({ user: user._id });
        if (claimCount > 0) {
          flags.push('new_user_immediate_claims');
        }
      }

      // Unverified user
      if (!user.isVerified) {
        flags.push('unverified_user');
      }

      // Incomplete profile
      if (!user.phone || !user.location.address) {
        flags.push('incomplete_profile');
      }

      return flags.length > 0 ? flags.join(',') : null;
    } catch (error) {
      console.error('Error checking user behavior:', error);
      return null;
    }
  }

  // Calculate fraud risk score
  calculateRiskScore(flags, user) {
    try {
      let score = 0;

      // Base score for each flag
      const flagWeights = {
        'multiple_claims': 30,
        'rapid_claims': 40,
        'location_anomaly': 25,
        'amount_anomaly': 20,
        'repetitive_trigger': 15,
        'multiple_trigger_types_pattern': 10,
        'new_user_immediate_claims': 35,
        'unverified_user': 15,
        'incomplete_profile': 10,
        'detection_error': 5
      };

      flags.forEach(flag => {
        // Find matching weight
        const matchingWeight = Object.keys(flagWeights).find(key => flag.includes(key));
        if (matchingWeight) {
          score += flagWeights[matchingWeight];
        }
      });

      // Adjust based on user history
      if (user.totalClaims > 10) score += 10;
      if (user.totalPayouts > 5000) score += 15;

      return Math.min(score, 100); // Cap at 100
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 50; // Default medium risk
    }
  }

  // Get recommendations based on fraud flags
  getRecommendations(flags) {
    try {
      const recommendations = [];

      if (flags.some(f => f.includes('multiple_claims') || f.includes('rapid_claims'))) {
        recommendations.push('manual_review');
        recommendations.push('temporary_suspend');
      }

      if (flags.some(f => f.includes('location_anomaly'))) {
        recommendations.push('verify_location');
        recommendations.push('document_required');
      }

      if (flags.some(f => f.includes('amount_anomaly'))) {
        recommendations.push('amount_verification');
        recommendations.push('escalate_to_supervisor');
      }

      if (flags.some(f => f.includes('new_user_immediate_claims'))) {
        recommendations.push('identity_verification');
        recommendations.push('enhanced_monitoring');
      }

      if (flags.length >= 3) {
        recommendations.push('investigation_required');
        recommendations.push('potential_account_suspension');
      }

      if (recommendations.length === 0) {
        recommendations.push('standard_processing');
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return ['manual_review'];
    }
  }

  // Calculate distance between two coordinates (in meters)
  calculateDistance(coord1, coord2) {
    try {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = coord1[1] * Math.PI / 180;
      const φ2 = coord2[1] * Math.PI / 180;
      const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
      const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  }

  // Get fraud statistics for admin dashboard
  async getFraudStats() {
    try {
      const Claim = require('../models/Claim');
      const User = require('../models/User');

      const stats = {
        totalFraudClaims: await Claim.countDocuments({ isFraudulent: true }),
        suspiciousClaims: await Claim.countDocuments({ 
          fraudFlags: { $exists: true, $ne: [] } 
        }),
        fraudRate: 0,
        commonFraudTypes: {},
        highRiskUsers: 0
      };

      // Calculate fraud rate
      const totalClaims = await Claim.countDocuments();
      stats.fraudRate = totalClaims > 0 ? (stats.totalFraudClaims / totalClaims * 100).toFixed(2) : 0;

      // Get common fraud types
      const fraudClaims = await Claim.find({ 
        fraudFlags: { $exists: true, $ne: [] } 
      });
      
      fraudClaims.forEach(claim => {
        claim.fraudFlags.forEach(flag => {
          stats.commonFraudTypes[flag] = (stats.commonFraudTypes[flag] || 0) + 1;
        });
      });

      // Get high risk users (multiple suspicious claims)
      const suspiciousUsers = await Claim.aggregate([
        { $match: { fraudFlags: { $exists: true, $ne: [] } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $match: { count: { $gte: 3 } } }
      ]);
      
      stats.highRiskUsers = suspiciousUsers.length;

      return stats;
    } catch (error) {
      console.error('Error getting fraud stats:', error);
      return {
        totalFraudClaims: 0,
        suspiciousClaims: 0,
        fraudRate: 0,
        commonFraudTypes: {},
        highRiskUsers: 0
      };
    }
  }
}

module.exports = new FraudDetector();
