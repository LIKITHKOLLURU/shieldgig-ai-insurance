const axios = require('axios');

class RiskProfiler {
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.aqiApiKey = process.env.AQI_API_KEY;
  }

  // Calculate risk score based on location and historical data
  async calculateRiskScore(location) {
    try {
      const { latitude, longitude, city } = location;
      
      // Get historical weather data (simulated for demo)
      const weatherRisk = await this.getWeatherRisk(latitude, longitude);
      
      // Get historical AQI data (simulated for demo)
      const aqiRisk = await this.getAQIRisk(city);
      
      // Get geographical risk factors
      const geoRisk = this.getGeographicalRisk(city);
      
      // Calculate composite risk score
      const riskScore = this.calculateCompositeRisk(weatherRisk, aqiRisk, geoRisk);
      
      return {
        score: riskScore,
        level: this.getRiskLevel(riskScore),
        factors: {
          weather: weatherRisk,
          aqi: aqiRisk,
          geographical: geoRisk
        }
      };
    } catch (error) {
      console.error('Risk calculation error:', error);
      // Return default medium risk on error
      return {
        score: 50,
        level: 'medium',
        factors: {
          weather: 0.3,
          aqi: 0.3,
          geographical: 0.4
        }
      };
    }
  }

  // Get weather risk based on historical data
  async getWeatherRisk(latitude, longitude) {
    try {
      // Simulate weather risk calculation
      // In production, this would call weather API and analyze historical data
      
      // Cities with higher rainfall risk (example data)
      const highRainfallCities = ['mumbai', 'bangalore', 'kolkata', 'chennai'];
      const moderateRainfallCities = ['delhi', 'hyderabad', 'pune'];
      
      // Simulate city detection from coordinates (simplified)
      const cityRisk = Math.random() * 0.6 + 0.2; // Random between 0.2-0.8
      
      return Math.min(cityRisk, 1.0);
    } catch (error) {
      console.error('Weather risk calculation error:', error);
      return 0.5; // Default medium risk
    }
  }

  // Get AQI risk based on historical data
  async getAQIRisk(city) {
    try {
      // Simulate AQI risk based on city
      // In production, this would analyze historical AQI data
      
      const highAQICities = ['delhi', 'kolkata', 'mumbai', 'lucknow'];
      const moderateAQICities = ['bangalore', 'hyderabad', 'chennai', 'pune'];
      
      const cityLower = city.toLowerCase();
      let aqiRisk = 0.3; // Default moderate
      
      if (highAQICities.includes(cityLower)) {
        aqiRisk = 0.7 + Math.random() * 0.2; // 0.7-0.9
      } else if (moderateAQICities.includes(cityLower)) {
        aqiRisk = 0.4 + Math.random() * 0.2; // 0.4-0.6
      } else {
        aqiRisk = 0.2 + Math.random() * 0.3; // 0.2-0.5
      }
      
      return Math.min(aqiRisk, 1.0);
    } catch (error) {
      console.error('AQI risk calculation error:', error);
      return 0.4; // Default low-medium risk
    }
  }

  // Get geographical risk factors
  getGeographicalRisk(city) {
    try {
      // Simulate geographical risk based on city characteristics
      const cityLower = city.toLowerCase();
      
      // Coastal cities might have different risk patterns
      const coastalCities = ['mumbai', 'chennai', 'kolkata', 'kochi'];
      // Metropolitan areas might have higher pollution
      const metroCities = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad'];
      
      let geoRisk = 0.3; // Default
      
      if (coastalCities.includes(cityLower)) {
        geoRisk += 0.2; // Higher rainfall/cyclone risk
      }
      
      if (metroCities.includes(cityLower)) {
        geoRisk += 0.1; // Higher pollution/traffic risk
      }
      
      return Math.min(geoRisk, 1.0);
    } catch (error) {
      console.error('Geographical risk calculation error:', error);
      return 0.3;
    }
  }

  // Calculate composite risk score
  calculateCompositeRisk(weatherRisk, aqiRisk, geoRisk) {
    // Weighted average of different risk factors
    const weights = {
      weather: 0.4,
      aqi: 0.35,
      geographical: 0.25
    };
    
    const compositeScore = 
      (weatherRisk * weights.weather) +
      (aqiRisk * weights.aqi) +
      (geoRisk * weights.geographical);
    
    return Math.round(compositeScore * 100);
  }

  // Convert risk score to risk level
  getRiskLevel(score) {
    if (score <= 33) return 'low';
    if (score <= 66) return 'medium';
    return 'high';
  }

  // Update user risk profile
  async updateUserRiskProfile(userId, location) {
    try {
      const User = require('../models/User');
      
      const riskProfile = await this.calculateRiskScore(location);
      
      await User.findByIdAndUpdate(userId, {
        riskLevel: riskProfile.level,
        riskScore: riskProfile.score
      });
      
      return riskProfile;
    } catch (error) {
      console.error('Update user risk profile error:', error);
      throw error;
    }
  }

  // Get recommended plan based on risk level
  getRecommendedPlan(riskLevel) {
    const planMapping = {
      'low': {
        planId: 'basic',
        premium: 20,
        coverage: 500
      },
      'medium': {
        planId: 'standard',
        premium: 40,
        coverage: 1000
      },
      'high': {
        planId: 'premium',
        premium: 60,
        coverage: 1500
      }
    };
    
    return planMapping[riskLevel] || planMapping['medium'];
  }
}

module.exports = new RiskProfiler();
