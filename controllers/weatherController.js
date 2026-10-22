import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import {
  resolveFarmCoordinates,
  fetchLiveWeather,
  evaluateWeatherRisks,
} from "../services/weatherAlertService.js";
import { buildIdOrSlugQuery } from "../utils/slugify.js";

// In-memory cache for weather data per location to avoid calling external weather API unnecessarily (10-minute cache)
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function getCachedOrFreshWeather(lat, lon) {
  const roundedLat = Number(lat).toFixed(2);
  const roundedLon = Number(lon).toFixed(2);
  const cacheKey = `${roundedLat}:${roundedLon}`;

  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fresh = await fetchLiveWeather(roundedLat, roundedLon);
  weatherCache.set(cacheKey, { timestamp: now, data: fresh });
  return fresh;
}

/**
 * Get active smart weather alerts for the authenticated farmer
 */
export const getWeatherAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { farmId, lat: queryLat, lon: queryLon } = req.query;

    let targetFarm = null;
    let farms = [];

    if (farmId) {
      targetFarm = await Farm.findOne(buildIdOrSlugQuery(farmId, { user: userId }));
    }

    if (!targetFarm) {
      farms = await Farm.find({ user: userId }).lean();
      targetFarm = farms[0] || null;
    }

    // Resolve active crops
    const farmIds = targetFarm ? [targetFarm._id] : farms.map((f) => f._id);
    const activeCrops = await Crop.find({
      farm: { $in: farmIds },
      status: "active",
    })
      .select("cropName variety sowingDate expectedDurationDays status")
      .lean();

    // Resolve coordinates
    let coords;
    if (queryLat && queryLon) {
      coords = { lat: Number(queryLat), lon: Number(queryLon), source: "query" };
    } else {
      coords = resolveFarmCoordinates(targetFarm);
    }

    // Fetch live weather
    const weatherData = await getCachedOrFreshWeather(coords.lat, coords.lon);

    // Evaluate smart agricultural risk alerts
    const alerts = evaluateWeatherRisks(weatherData, activeCrops);

    // Current weather summary
    const current = weatherData.current_weather || {};
    const daily = weatherData.daily || {};

    const formattedDaily = (daily.time || []).map((date, idx) => ({
      date,
      maxTemp: daily.temperature_2m_max?.[idx] ?? null,
      minTemp: daily.temperature_2m_min?.[idx] ?? null,
      rainSumMm: daily.precipitation_sum?.[idx] ?? 0,
      rainProbability: daily.precipitation_probability_max?.[idx] ?? 0,
      windSpeedKmH: daily.wind_speed_10m_max?.[idx] ?? 0,
    }));

    res.json({
      location: {
        farmName: targetFarm?.farmName || "My Farm Location",
        village: targetFarm?.location?.village || "Agri Belt",
        district: targetFarm?.location?.district || "Local APMC District",
        state: targetFarm?.location?.state || "India",
        latitude: coords.lat,
        longitude: coords.lon,
        source: coords.source,
      },
      current: {
        temperature: current.temperature,
        windspeed: current.windspeed,
        weathercode: current.weathercode,
        time: current.time,
        isDay: current.is_day === 1,
        humidity: weatherData.hourly?.relative_humidity_2m?.[0] || 60,
      },
      alertsCount: alerts.length,
      hasSevereAlerts: alerts.some((a) => a.severity === "high"),
      alerts,
      forecast: formattedDaily,
    });
  } catch (error) {
    console.error("getWeatherAlerts error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get weather forecast and alerts for a specific farm
 */
export const getFarmWeather = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const farm = await Farm.findOne(buildIdOrSlugQuery(id, { user: userId }));
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const coords = resolveFarmCoordinates(farm);
    const weatherData = await getCachedOrFreshWeather(coords.lat, coords.lon);

    const activeCrops = await Crop.find({ farm: farm._id, status: "active" }).lean();
    const alerts = evaluateWeatherRisks(weatherData, activeCrops);

    res.json({
      farm: {
        id: farm._id,
        slug: farm.slug,
        farmName: farm.farmName,
        location: farm.location,
      },
      current: weatherData.current_weather,
      alerts,
      daily: weatherData.daily,
    });
  } catch (error) {
    console.error("getFarmWeather error:", error);
    res.status(500).json({ message: error.message });
  }
};
