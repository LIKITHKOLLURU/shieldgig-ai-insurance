class PayoutService {
  constructor() {
    this.paymentMethods = {
      upi: {
        name: 'UPI',
        processingTime: 'instant',
        minAmount: 1,
        maxAmount: 10000
      },
      wallet: {
        name: 'Digital Wallet',
        processingTime: 'instant',
        minAmount: 1,
        maxAmount: 5000
      },
      bank: {
        name: 'Bank Transfer',
        processingTime: '2-4 hours',
        minAmount: 100,
        maxAmount: 50000
      }
    };
  }

  // Process payout for an approved claim
  async processPayout(claim, paymentMethod = 'upi') {
    try {
      console.log(`Processing payout for claim ${claim._id} via ${paymentMethod}`);

      // Validate payment method
      if (!this.paymentMethods[paymentMethod]) {
        throw new Error('Invalid payment method');
      }

      // Check claim status
      if (claim.status !== 'approved') {
        throw new Error('Claim must be approved before payout');
      }

      // Check if already processed
      if (claim.payoutReference) {
        throw new Error('Payout already processed');
      }

      // Validate amount
      const method = this.paymentMethods[paymentMethod];
      if (claim.claimAmount < method.minAmount || claim.claimAmount > method.maxAmount) {
        throw new Error(`Amount must be between ${method.minAmount} and ${method.maxAmount} for ${method.name}`);
      }

      // Simulate payment processing
      const payoutResult = await this.simulatePayment(claim, paymentMethod);

      // Update claim with payout details
      claim.payoutReference = payoutResult.reference;
      claim.processedAt = new Date();
      claim.status = 'processed';
      
      await claim.save();

      // Send notification (simulated)
      await this.sendPayoutNotification(claim, payoutResult);

      console.log(`Payout processed successfully: ${payoutResult.reference}`);
      
      return {
        success: true,
        reference: payoutResult.reference,
        amount: claim.claimAmount,
        method: paymentMethod,
        processingTime: method.processingTime,
        estimatedDelivery: this.getEstimatedDelivery(paymentMethod)
      };
    } catch (error) {
      console.error('Payout processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulate payment processing
  async simulatePayment(claim, paymentMethod) {
    try {
      // Simulate API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const reference = this.generatePaymentReference(paymentMethod);
      
      // Simulate different success rates based on method
      const successRates = {
        upi: 0.98,
        wallet: 0.95,
        bank: 0.92
      };

      const successRate = successRates[paymentMethod] || 0.95;
      
      if (Math.random() > successRate) {
        throw new Error('Payment gateway temporarily unavailable');
      }

      return {
        reference,
        status: 'success',
        timestamp: new Date(),
        gateway: 'simulated_payment_gateway'
      };
    } catch (error) {
      console.error('Payment simulation error:', error);
      throw error;
    }
  }

  // Generate unique payment reference
  generatePaymentReference(paymentMethod) {
    const prefixes = {
      upi: 'UPI',
      wallet: 'WLT',
      bank: 'BNK'
    };
    
    const prefix = prefixes[paymentMethod] || 'PAY';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    return `${prefix}${timestamp}${random}`;
  }

  // Get estimated delivery time
  getEstimatedDelivery(paymentMethod) {
    const deliveryTimes = {
      upi: 'Within 5 minutes',
      wallet: 'Within 10 minutes',
      bank: 'Within 4 hours'
    };
    
    return deliveryTimes[paymentMethod] || 'Within 24 hours';
  }

  // Send payout notification (simulated)
  async sendPayoutNotification(claim, payoutResult) {
    try {
      const User = require('../models/User');
      const user = await User.findById(claim.user);
      
      if (!user) return;

      // Simulate sending SMS/Email/Push notification
      const notification = {
        type: 'payout_processed',
        userId: user._id,
        message: `Your claim of ₹${claim.claimAmount} has been processed. Reference: ${payoutResult.reference}`,
        channels: ['sms', 'email', 'push'],
        timestamp: new Date()
      };

      console.log('Notification sent:', notification);
      
      // In production, this would integrate with actual notification services
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Get payout status
  async getPayoutStatus(payoutReference) {
    try {
      const Claim = require('../models/Claim');
      
      const claim = await Claim.findOne({ payoutReference });
      if (!claim) {
        throw new Error('Payout not found');
      }

      return {
        reference: payoutReference,
        status: claim.status,
        amount: claim.claimAmount,
        processedAt: claim.processedAt,
        claimId: claim._id
      };
    } catch (error) {
      console.error('Error getting payout status:', error);
      throw error;
    }
  }

  // Retry failed payout
  async retryPayout(claimId, paymentMethod = 'upi') {
    try {
      const Claim = require('../models/Claim');
      
      const claim = await Claim.findById(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      if (claim.status !== 'approved') {
        throw new Error('Only approved claims can be retried');
      }

      // Clear previous payout reference if any
      claim.payoutReference = null;
      claim.processedAt = null;
      
      return await this.processPayout(claim, paymentMethod);
    } catch (error) {
      console.error('Error retrying payout:', error);
      throw error;
    }
  }

  // Get payout statistics
  async getPayoutStats(startDate, endDate) {
    try {
      const Claim = require('../models/Claim');
      
      const matchStage = {
        status: 'processed',
        processedAt: { $exists: true }
      };

      if (startDate && endDate) {
        matchStage.processedAt.$gte = new Date(startDate);
        matchStage.processedAt.$lte = new Date(endDate);
      }

      const stats = await Claim.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPayouts: { $sum: '$claimAmount' },
            count: { $sum: 1 },
            averageAmount: { $avg: '$claimAmount' },
            minAmount: { $min: '$claimAmount' },
            maxAmount: { $max: '$claimAmount' }
          }
        }
      ]);

      const result = stats[0] || {
        totalPayouts: 0,
        count: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0
      };

      // Get daily payout trends
      const dailyTrends = await Claim.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$processedAt' } },
            totalAmount: { $sum: '$claimAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        ...result,
        dailyTrends
      };
    } catch (error) {
      console.error('Error getting payout stats:', error);
      return {
        totalPayouts: 0,
        count: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        dailyTrends: []
      };
    }
  }

  // Validate payment details
  validatePaymentDetails(user, paymentMethod, paymentDetails) {
    try {
      const errors = [];

      switch (paymentMethod) {
        case 'upi':
          if (!paymentDetails.upiId) {
            errors.push('UPI ID is required');
          } else if (!this.validateUPIId(paymentDetails.upiId)) {
            errors.push('Invalid UPI ID format');
          }
          break;
        
        case 'wallet':
          if (!paymentDetails.walletNumber) {
            errors.push('Wallet number is required');
          } else if (!paymentDetails.walletProvider) {
            errors.push('Wallet provider is required');
          }
          break;
        
        case 'bank':
          if (!paymentDetails.accountNumber) {
            errors.push('Account number is required');
          }
          if (!paymentDetails.ifscCode) {
            errors.push('IFSC code is required');
          } else if (!this.validateIFSCCode(paymentDetails.ifscCode)) {
            errors.push('Invalid IFSC code format');
          }
          break;
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating payment details:', error);
      return {
        isValid: false,
        errors: ['Validation error occurred']
      };
    }
  }

  // Validate UPI ID format
  validateUPIId(upiId) {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upiId);
  }

  // Validate IFSC code format
  validateIFSCCode(ifscCode) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifscCode);
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return this.paymentMethods;
  }
}

module.exports = new PayoutService();
