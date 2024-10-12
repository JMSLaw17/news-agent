import axios from 'axios';
import { WeatherData } from '@/types';

export async function getWeather(location: string, latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
        hourly: 'temperature_2m',
        temperature_unit: 'fahrenheit'
      }
    });

    const data = response.data.current;
    return {
      location,
      temperature: data.temperature_2m,
      humidity: data.relative_humidity_2m,
      windSpeed: data.wind_speed_10m
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}
