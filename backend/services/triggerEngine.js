const cron = require('node-cron');
const EnvironmentalTrigger = require('../models/EnvironmentalTrigger');
const Claim = require('../models/Claim');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const fraudDetector = require('./fraudDetector');
const externalAPIs = require('./externalAPIs');

class TriggerEngine {
  constructor() {
    this.triggerThresholds = {
      rain: 50, // mm
      heat: 45, // °C
      aqi: 300, // AQI value
      curfew: 1 // boolean
    };
    
    this.startMonitoring();
  }

  // Start environmental monitoring
  startMonitoring() {
    // Check for triggers every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('Checking environmental triggers...');
      await this.checkAllTriggers();
    });

    // Check for weather triggers every 15 minutes during monsoon season (simplified)
    cron.schedule('*/15 * * * *', async () => {
      console.log('Checking weather triggers...');
      await this.checkWeatherTriggers();
    });

    console.log('Trigger engine started');
  }

  // Check all types of triggers
  async checkAllTriggers() {
    try {
      await Promise.all([
        this.checkWeatherTriggers(),
        this.checkAQITriggers(),
        this.checkCurfewTriggers()
      ]);
    } catch (error) {
      console.error('Error checking triggers:', error);
    }
  }

  // Check weather triggers (rain, heat)
  async checkWeatherTriggers() {
    try {
      // Get all active users with subscriptions
      const activeUsers = await User.find({
        isActive: true,
        role: 'worker'
      }).populate('currentPlan');

      // Group users by city to optimize API calls
      const usersByCity = this.groupUsersByCity(activeUsers);

      for (const [city, users] of Object.entries(usersByCity)) {
        try {
          const weatherData = await externalAPIs.getCurrentWeather(
            users[0].location.coordinates[1], 
            users[0].location.coordinates[0]
          );
          
          // Check rain trigger
          if (weatherData.rainfall > this.triggerThresholds.rain) {
            await this.processTrigger('rain', weatherData.rainfall, users, weatherData);
          }
          
          // Check heat trigger
          if (weatherData.temperature > this.triggerThresholds.heat) {
            await this.processTrigger('heat', weatherData.temperature, users, weatherData);
          }
        } catch (error) {
          console.error(`Error checking weather for ${city}:`, error);
        }
      }
    } catch (error) {
      console.error('Weather trigger check error:', error);
    }
  }

  // Check AQI triggers
  async checkAQITriggers() {
    try {
      const activeUsers = await User.find({
        isActive: true,
        role: 'worker'
      }).populate('currentPlan');

      const usersByCity = this.groupUsersByCity(activeUsers);

      for (const [city, users] of Object.entries(usersByCity)) {
        try {
          const aqiData = await externalAPIs.getCurrentAQI(
            users[0].location.coordinates[1], 
            users[0].location.coordinates[0]
          );
          
          if (aqiData.value > this.triggerThresholds.aqi) {
            await this.processTrigger('aqi', aqiData.value, users, aqiData);
          }
        } catch (error) {
          console.error(`Error checking AQI for ${city}:`, error);
        }
      }
    } catch (error) {
      console.error('AQI trigger check error:', error);
    }
  }

  // Check curfew triggers (simulated)
  async checkCurfewTriggers() {
    try {
      // In production, this would integrate with government APIs
      // For demo, we'll simulate random curfew alerts
      
      const activeUsers = await User.find({
        isActive: true,
        role: 'worker'
      }).populate('currentPlan');

      // Simulate curfew in random cities (1% chance)
      if (Math.random() < 0.01) {
        const cities = ['delhi', 'mumbai', 'bangalore'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        
        const affectedUsers = activeUsers.filter(user => 
          user.location.city.toLowerCase() === randomCity
        );

        if (affectedUsers.length > 0) {
          await this.processTrigger('curfew', 1, affectedUsers, {
            city: randomCity,
            message: 'Simulated curfew alert'
          });
        }
      }
    } catch (error) {
      console.error('Curfew trigger check error:', error);
    }
  }

  // Process a trigger and generate claims
  async processTrigger(triggerType, triggerValue, users, eventData) {
    try {
      console.log(`Processing ${triggerType} trigger with value: ${triggerValue}`);

      // Check if trigger already exists to avoid duplicates
      const existingTrigger = await EnvironmentalTrigger.findOne({
        type: triggerType,
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
      });

      if (existingTrigger) {
        console.log(`Trigger ${triggerType} already processed recently`);
        return;
      }

      // Create environmental trigger record
      const trigger = new EnvironmentalTrigger({
        type: triggerType,
        threshold: this.triggerThresholds[triggerType],
        currentValue: triggerValue,
        location: {
          type: 'Point',
          coordinates: [0, 0], // Will be updated per user
          city: eventData.city || 'Unknown'
        },
        affectedUsers: users.map(u => u._id),
        source: 'automated_monitoring',
        rawData: eventData
      });

      await trigger.save();

      // Generate claims for eligible users
      const claims = [];
      for (const user of users) {
        try {
          const claim = await this.generateClaim(user, triggerType, triggerValue, eventData);
          if (claim) {
            claims.push(claim);
            trigger.claimsGenerated.push(claim._id);
          }
        } catch (error) {
          console.error(`Error generating claim for user ${user._id}:`, error);
        }
      }

      trigger.affectedUsers = claims.map(c => c.user);
      await trigger.save();

      console.log(`Generated ${claims.length} claims for ${triggerType} trigger`);
    } catch (error) {
      console.error('Error processing trigger:', error);
    }
  }

  // Generate claim for a user
  async generateClaim(user, triggerType, triggerValue, eventData) {
    try {
      // Check if user has active subscription
      const activeSubscription = await Subscription.findOne({
        user: user._id,
        status: 'active',
        endDate: { $gt: new Date() }
      }).populate('plan');

      if (!activeSubscription) {
        console.log(`User ${user._id} has no active subscription`);
        return null;
      }

      // Check for duplicate claims
      const recentClaim = await Claim.findOne({
        user: user._id,
        triggerType,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
      });

      if (recentClaim) {
        console.log(`User ${user._id} already has a recent ${triggerType} claim`);
        return null;
      }

      // Calculate claim amount based on plan
      const claimAmount = this.calculateClaimAmount(activeSubscription.plan, triggerType);

      // Create claim
      const claim = new Claim({
        user: user._id,
        plan: activeSubscription.plan._id,
        triggerType,
        triggerValue,
        location: user.location,
        eventData: {
          weather: {
            temperature: eventData.temperature,
            humidity: eventData.humidity,
            rainfall: eventData.rainfall,
            windSpeed: eventData.windSpeed
          },
          aqi: {
            value: eventData.value,
            category: eventData.category
          },
          timestamp: new Date()
        },
        claimAmount,
        status: 'approved' // Auto-approve for parametric triggers
      });

      // Run fraud detection
      const fraudResult = await fraudDetector.analyzeClaim(claim, user);
      if (fraudResult.isSuspicious) {
        claim.fraudFlags = fraudResult.flags;
        claim.status = 'pending'; // Manual review required
        claim.isFraudulent = false; // Don't mark as fraudulent yet
      }

      await claim.save();

      // Update user stats if approved
      if (claim.status === 'approved') {
        await User.findByIdAndUpdate(user._id, {
          $inc: { 
            totalClaims: 1, 
            totalPayouts: claimAmount 
          }
        });
      }

      return claim;
    } catch (error) {
      console.error('Error generating claim:', error);
      return null;
    }
  }

  // Calculate claim amount based on plan and trigger type
  calculateClaimAmount(plan, triggerType) {
    const baseAmount = plan.coverageAmount || 1000;
    
    // Adjust based on trigger severity
    const multipliers = {
      rain: 0.8,
      heat: 0.6,
      aqi: 0.7,
      curfew: 1.0
    };

    return Math.round(baseAmount * (multipliers[triggerType] || 0.7));
  }

  // Get weather data (simulated)
  async getWeatherData(city) {
    try {
      // Simulate weather data
      // In production, this would call a real weather API
      
      const baseTemp = 25 + Math.random() * 15;
      const rainfall = Math.random() * 100;
      const humidity = 40 + Math.random() * 40;
      const windSpeed = Math.random() * 30;

      return {
        temperature: baseTemp,
        rainfall,
        humidity,
        windSpeed,
        city,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw error;
    }
  }

  // Get AQI data (simulated)
  async getAQIData(city) {
    try {
      // Simulate AQI data
      // In production, this would call a real AQI API
      
      const cityLower = city.toLowerCase();
      let aqiValue = 50 + Math.random() * 200;

      // Higher AQI for major cities
      const highAQICities = ['delhi', 'kolkata', 'mumbai'];
      if (highAQICities.includes(cityLower)) {
        aqiValue += 100;
      }

      let category = 'Moderate';
      if (aqiValue > 300) category = 'Hazardous';
      else if (aqiValue > 200) category = 'Very Unhealthy';
      else if (aqiValue > 150) category = 'Unhealthy';
      else if (aqiValue > 100) category = 'Unhealthy for Sensitive Groups';

      return {
        value: Math.round(aqiValue),
        category,
        city,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting AQI data:', error);
      throw error;
    }
  }

  // Group users by city for efficient API calls
  groupUsersByCity(users) {
    return users.reduce((groups, user) => {
      const city = user.location.city.toLowerCase();
      if (!groups[city]) {
        groups[city] = [];
      }
      groups[city].push(user);
      return groups;
    }, {});
  }
}

module.exports = new TriggerEngine();
