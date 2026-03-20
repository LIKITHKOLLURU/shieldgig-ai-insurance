const axios = require('axios');

class ExternalAPIService {
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.aqiApiKey = process.env.AQI_API_KEY;
    
    // API endpoints
    this.weatherAPI = {
      current: 'https://api.openweathermap.org/data/2.5/weather',
      forecast: 'https://api.openweathermap.org/data/2.5/forecast'
    };
    
    this.aqiAPI = {
      current: 'https://api.waqi.info/feed',
      search: 'https://api.waqi.info/search'
    };
  }

  // Get current weather data for a location
  async getCurrentWeather(latitude, longitude) {
    try {
      if (!this.weatherApiKey || this.weatherApiKey === 'your_weather_api_key_here') {
        // Return simulated data if no API key is provided
        return this.getSimulatedWeatherData(latitude, longitude);
      }

      const response = await axios.get(this.weatherAPI.current, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.weatherApiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility,
        description: data.weather[0].description,
        location: {
          city: data.name,
          country: data.sys.country
        },
        timestamp: new Date(),
        source: 'openweathermap'
      };
    } catch (error) {
      console.error('Weather API error:', error);
      // Fallback to simulated data
      return this.getSimulatedWeatherData(latitude, longitude);
    }
  }

  // Get weather forecast for a location
  async getWeatherForecast(latitude, longitude) {
    try {
      if (!this.weatherApiKey || this.weatherApiKey === 'your_weather_api_key_here') {
        return this.getSimulatedForecastData(latitude, longitude);
      }

      const response = await axios.get(this.weatherAPI.forecast, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.weatherApiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      return data.list.map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        rainfall: item.rain?.['3h'] || 0,
        windSpeed: item.wind.speed,
        pressure: item.main.pressure,
        description: item.weather[0].description
      }));
    } catch (error) {
      console.error('Weather forecast API error:', error);
      return this.getSimulatedForecastData(latitude, longitude);
    }
  }

  // Get AQI data for a location
  async getCurrentAQI(latitude, longitude) {
    try {
      if (!this.aqiApiKey || this.aqiApiKey === 'your_aqi_api_key_here') {
        return this.getSimulatedAQIData(latitude, longitude);
      }

      // Find nearest AQI station
      const searchResponse = await axios.get(`${this.aqiAPI.search}/`, {
        params: {
          token: this.aqiApiKey,
          keyword: `${latitude},${longitude}`
        }
      });

      if (searchResponse.data.data.length === 0) {
        return this.getSimulatedAQIData(latitude, longitude);
      }

      const station = searchResponse.data.data[0];
      const stationUrl = station.aqi;

      const aqiResponse = await axios.get(`${this.aqiAPI.current}/${stationUrl}/`, {
        params: {
          token: this.aqiApiKey
        }
      });

      const data = aqiResponse.data.data;
      return {
        value: data.aqi,
        category: this.getAQICategory(data.aqi),
        pm25: data.iaqi.pm25?.v || 0,
        pm10: data.iaqi.pm10?.v || 0,
        o3: data.iaqi.o3?.v || 0,
        no2: data.iaqi.no2?.v || 0,
        so2: data.iaqi.so2?.v || 0,
        co: data.iaqi.co?.v || 0,
        location: {
          city: data.city.name,
          station: data.attributions[0]?.name || 'Unknown Station'
        },
        timestamp: new Date(),
        source: 'waqi'
      };
    } catch (error) {
      console.error('AQI API error:', error);
      return this.getSimulatedAQIData(latitude, longitude);
    }
  }

  // Get AQI data by city name
  async getAQIByCity(city) {
    try {
      if (!this.aqiApiKey || this.aqiApiKey === 'your_aqi_api_key_here') {
        return this.getSimulatedAQIDataByCity(city);
      }

      const response = await axios.get(`${this.aqiAPI.current}/${city}/`, {
        params: {
          token: this.aqiApiKey
        }
      });

      const data = response.data.data;
      return {
        value: data.aqi,
        category: this.getAQICategory(data.aqi),
        pm25: data.iaqi.pm25?.v || 0,
        pm10: data.iaqi.pm10?.v || 0,
        location: {
          city: data.city.name,
          station: data.attributions[0]?.name || 'Unknown Station'
        },
        timestamp: new Date(),
        source: 'waqi'
      };
    } catch (error) {
      console.error('AQI by city API error:', error);
      return this.getSimulatedAQIDataByCity(city);
    }
  }

  // Get AQI category based on value
  getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  // Simulated weather data for demo purposes
  getSimulatedWeatherData(latitude, longitude) {
    const baseTemp = 25 + Math.random() * 15;
    const rainfall = Math.random() * 100;
    const humidity = 40 + Math.random() * 40;
    const windSpeed = Math.random() * 30;

    return {
      temperature: Math.round(baseTemp * 10) / 10,
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      pressure: 1013 + Math.round((Math.random() - 0.5) * 20),
      visibility: 5000 + Math.round(Math.random() * 5000),
      description: rainfall > 50 ? 'heavy rain' : rainfall > 10 ? 'moderate rain' : 'clear sky',
      location: {
        city: 'Demo City',
        country: 'Demo Country'
      },
      timestamp: new Date(),
      source: 'simulated'
    };
  }

  // Simulated forecast data
  getSimulatedForecastData(latitude, longitude) {
    const forecast = [];
    const baseTemp = 25 + Math.random() * 15;
    
    for (let i = 0; i < 5; i++) {
      forecast.push({
        timestamp: new Date(Date.now() + i * 3 * 60 * 60 * 1000), // Every 3 hours
        temperature: Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10,
        humidity: Math.round(40 + Math.random() * 40),
        rainfall: Math.round(Math.random() * 100 * 10) / 10,
        windSpeed: Math.round(Math.random() * 30 * 10) / 10,
        pressure: Math.round(1013 + (Math.random() - 0.5) * 20),
        description: Math.random() > 0.7 ? 'light rain' : 'clear sky'
      });
    }
    
    return forecast;
  }

  // Simulated AQI data
  getSimulatedAQIData(latitude, longitude) {
    const cityAQI = {
      'delhi': 150 + Math.round(Math.random() * 100),
      'mumbai': 80 + Math.round(Math.random() * 80),
      'bangalore': 60 + Math.round(Math.random() * 60),
      'kolkata': 120 + Math.round(Math.random() * 80),
      'chennai': 70 + Math.round(Math.random() * 70),
      'hyderabad': 90 + Math.round(Math.random() * 70),
      'pune': 65 + Math.round(Math.random() * 65)
    };

    const defaultAQI = 50 + Math.round(Math.random() * 100);
    const aqiValue = cityAQI['demo'] || defaultAQI;

    return {
      value: aqiValue,
      category: this.getAQICategory(aqiValue),
      pm25: Math.round(aqiValue * 0.6),
      pm10: Math.round(aqiValue * 0.8),
      o3: Math.round(aqiValue * 0.4),
      no2: Math.round(aqiValue * 0.3),
      so2: Math.round(aqiValue * 0.2),
      co: Math.round(aqiValue * 0.1),
      location: {
        city: 'Demo City',
        station: 'Demo Station'
      },
      timestamp: new Date(),
      source: 'simulated'
    };
  }

  // Simulated AQI data by city
  getSimulatedAQIDataByCity(city) {
    const cityLower = city.toLowerCase();
    const cityAQI = {
      'delhi': 150 + Math.round(Math.random() * 100),
      'mumbai': 80 + Math.round(Math.random() * 80),
      'bangalore': 60 + Math.round(Math.random() * 60),
      'kolkata': 120 + Math.round(Math.random() * 80),
      'chennai': 70 + Math.round(Math.random() * 70),
      'hyderabad': 90 + Math.round(Math.random() * 70),
      'pune': 65 + Math.round(Math.random() * 65)
    };

    const aqiValue = cityAQI[cityLower] || (50 + Math.round(Math.random() * 100));

    return {
      value: aqiValue,
      category: this.getAQICategory(aqiValue),
      pm25: Math.round(aqiValue * 0.6),
      pm10: Math.round(aqiValue * 0.8),
      location: {
        city: city,
        station: `${city} Monitoring Station`
      },
      timestamp: new Date(),
      source: 'simulated'
    };
  }

  // Get environmental data for multiple locations (batch processing)
  async getBatchEnvironmentalData(locations) {
    const results = [];
    
    for (const location of locations) {
      try {
        const [weather, aqi] = await Promise.all([
          this.getCurrentWeather(location.latitude, location.longitude),
          this.getCurrentAQI(location.latitude, location.longitude)
        ]);
        
        results.push({
          location,
          weather,
          aqi,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Error getting data for location ${location.city}:`, error);
        results.push({
          location,
          weather: this.getSimulatedWeatherData(location.latitude, location.longitude),
          aqi: this.getSimulatedAQIData(location.latitude, location.longitude),
          timestamp: new Date(),
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Check for extreme weather conditions
  async checkExtremeWeather(latitude, longitude) {
    try {
      const weather = await this.getCurrentWeather(latitude, longitude);
      
      const extremes = {
        heavyRain: weather.rainfall > 50,
        extremeHeat: weather.temperature > 45,
        strongWinds: weather.windSpeed > 20,
        lowVisibility: weather.visibility < 1000,
        highHumidity: weather.humidity > 90
      };
      
      return {
        weather,
        extremes,
        hasExtreme: Object.values(extremes).some(Boolean),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error checking extreme weather:', error);
      return {
        weather: this.getSimulatedWeatherData(latitude, longitude),
        extremes: {
          heavyRain: false,
          extremeHeat: false,
          strongWinds: false,
          lowVisibility: false,
          highHumidity: false
        },
        hasExtreme: false,
        timestamp: new Date(),
        error: error.message
      };
    }
  }
}

module.exports = new ExternalAPIService();
