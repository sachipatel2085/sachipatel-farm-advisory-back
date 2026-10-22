import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

/**
 * Approximate GPS coordinates for common agricultural districts across India.
 * Used as high-accuracy fallback when a farm does not have GPS pins saved.
 */
const DISTRICT_COORDINATES = {
  // Gujarat
  rajkot: { lat: 22.30, lon: 70.80 },
  junagadh: { lat: 21.52, lon: 70.45 },
  amreli: { lat: 21.60, lon: 71.21 },
  ahmedabad: { lat: 23.02, lon: 72.57 },
  bhavnagar: { lat: 21.76, lon: 72.15 },
  anand: { lat: 22.56, lon: 72.92 },
  surat: { lat: 21.17, lon: 72.83 },
  vadodara: { lat: 22.30, lon: 73.18 },
  mehsana: { lat: 23.58, lon: 72.36 },
  banaskantha: { lat: 24.17, lon: 72.43 },
  kutch: { lat: 23.24, lon: 69.66 },

  // Maharashtra
  pune: { lat: 18.52, lon: 73.85 },
  nashik: { lat: 19.99, lon: 73.78 },
  nagpur: { lat: 21.14, lon: 79.08 },
  aurangabad: { lat: 19.87, lon: 75.34 },
  solapur: { lat: 17.65, lon: 75.90 },
  kolhapur: { lat: 16.70, lon: 74.24 },
  amravati: { lat: 20.93, lon: 77.75 },
  akola: { lat: 20.70, lon: 77.00 },

  // Madhya Pradesh / Rajasthan / Punjab / UP / Haryana
  indore: { lat: 22.71, lon: 75.85 },
  bhopal: { lat: 23.25, lon: 77.41 },
  ujjain: { lat: 23.17, lon: 75.78 },
  jaipur: { lat: 26.91, lon: 75.78 },
  jodhpur: { lat: 26.23, lon: 73.02 },
  ludhiana: { lat: 30.90, lon: 75.85 },
  karnal: { lat: 29.68, lon: 76.99 },
  varanasi: { lat: 25.31, lon: 82.97 },
  lucknow: { lat: 26.84, lon: 80.94 },
  patna: { lat: 25.59, lon: 85.13 },
};

const DEFAULT_COORDINATES = { lat: 22.30, lon: 70.80 }; // Gujarat/Central India agrarian baseline

/**
 * Resolves latitude and longitude for a farm based on location data.
 */
export function resolveFarmCoordinates(farm) {
  if (farm?.location?.latitude && farm?.location?.longitude) {
    return {
      lat: Number(farm.location.latitude),
      lon: Number(farm.location.longitude),
      source: "gps",
    };
  }

  const district = (farm?.location?.district || farm?.location?.village || "")
    .toLowerCase()
    .trim();

  if (district && DISTRICT_COORDINATES[district]) {
    return {
      ...DISTRICT_COORDINATES[district],
      source: "district",
    };
  }

  return {
    ...DEFAULT_COORDINATES,
    source: "default",
  };
}

/**
 * Fetches live weather data & 7-day forecast from Open-Meteo.
 */
export async function fetchLiveWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=7`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Evaluates smart agricultural weather risk rules.
 */
export function evaluateWeatherRisks(weatherData, activeCrops = []) {
  const alerts = [];
  const daily = weatherData?.daily;
  const hourly = weatherData?.hourly;
  const current = weatherData?.current_weather;

  if (!daily || !daily.time) return alerts;

  const cropNames = activeCrops.map((c) => (c.cropName || "").toLowerCase());

  // 1. FROST RISK ALERT (Pala / Thandi Warning)
  const minTemps = daily.temperature_2m_min || [];
  const lowestMinTemp = Math.min(...minTemps.slice(0, 3)); // Look at next 3 days
  const lowestDayIndex = minTemps.indexOf(lowestMinTemp);
  const frostDate = daily.time[lowestDayIndex];

  if (lowestMinTemp <= 4.0) {
    const vulnerable = activeCrops
      .filter((c) => {
        const name = (c.cropName || "").toLowerCase();
        return ["potato", "tomato", "mustard", "brinjal", "chilli", "gram", "chana"].some((v) =>
          name.includes(v)
        );
      })
      .map((c) => c.cropName);

    alerts.push({
      id: "alert_frost",
      type: "frost_risk",
      severity: lowestMinTemp <= 2.0 ? "high" : "medium",
      metric: `${lowestMinTemp}°C`,
      forecastDate: frostDate,
      vulnerableCrops: vulnerable.length > 0 ? vulnerable : ["Potato", "Tomato", "Mustard", "Chilli"],
      title: {
        en: `Severe Frost & Cold Wave Risk (${lowestMinTemp}°C)`,
        hi: `शीतलहर व पाला पड़ने की गंभीर चेतावनी (${lowestMinTemp}°C)`,
        gu: `હિમ અને અતિશય ઠંડી પડવાની ચેતવણી (${lowestMinTemp}°C)`,
        mr: `धुके व अतिथंडीचा तीव्र इशारा (${lowestMinTemp}°C)`,
      },
      message: {
        en: `Minimum temperature is forecasted to plunge to ${lowestMinTemp}°C on ${frostDate}. Cellular freezing and chilling injury risk is critical for tender crops.`,
        hi: `आने वाले दिनों में रात का तापमान गिरकर ${lowestMinTemp}°C तक पहुंचने की संभावना है। आलू, टमाटर और सरसों की फसल में पाले से भारी नुकसान हो सकता है।`,
        gu: `આગામી દિવસોમાં રાત્રિનું તાપમાન ઘટીને ${lowestMinTemp}°C થઈ શકે છે. બટાટા, ટામેટા અને રાયડાના પાકને હિમ લાગવાનો ભય છે.`,
        mr: `रात्रीचे तापमान घसरून ${lowestMinTemp}°C पर्यंत जाण्याची शक्यता आहे. बटाटा, टोमॅटो आणि मोहरीच्या पिकाला थंडीचा मोठा धोका संभवतो.`,
      },
      recommendedAction: {
        en: "Provide light evening irrigation to raise soil thermal capacity. Create smoke screens (smudging) along windward field borders between 3:00 AM - 6:00 AM.",
        hi: "शाम के समय हल्की सिंचाई करें ताकि जमीन में ऊष्मा बनी रहे। सुबह 3 से 6 बजे के बीच खेत की मेड़ों पर धुआं करें।",
        gu: "સાંજે હળવું પિયત આપો જેથી જમીન ગરમ રહે. વહેલી સવારે 3 થી 6 વચ્ચે ખેતરના શેઢે કચરો સળગાવી ધુમાડો કરો.",
        mr: "संध्याकाळी हलके पाणी द्या जेणेकरून जमिनीत उबदारपणा राहील. पहाटे 3 ते 6 दरम्यान शेताच्या बांधावर धूर करा.",
      },
    });
  }

  // 2. HIGH-HUMIDITY FUNGAL SPREAD ALERT (Blight & Mildew Hazard)
  let highHumidityHours = 0;
  if (hourly && hourly.relative_humidity_2m) {
    const next48HoursHumidity = hourly.relative_humidity_2m.slice(0, 48);
    highHumidityHours = next48HoursHumidity.filter((h) => h >= 82).length;
  }

  const currentHumidity = hourly?.relative_humidity_2m?.[0] || 65;
  const isHumid = highHumidityHours >= 8 || currentHumidity >= 85;

  if (isHumid) {
    const vulnerable = activeCrops
      .filter((c) => {
        const name = (c.cropName || "").toLowerCase();
        return ["tomato", "potato", "onion", "grapes", "chilli", "cumin", "cotton"].some((v) =>
          name.includes(v)
        );
      })
      .map((c) => c.cropName);

    alerts.push({
      id: "alert_fungal",
      type: "fungal_spread",
      severity: highHumidityHours >= 16 ? "high" : "medium",
      metric: `${currentHumidity}% Humidity (${highHumidityHours}h prolonged)`,
      vulnerableCrops: vulnerable.length > 0 ? vulnerable : ["Tomato", "Potato", "Chilli", "Onion"],
      title: {
        en: `High-Humidity Fungal Disease Spread Warning (${currentHumidity}% RH)`,
        hi: `अत्यधिक नमी व फफूंद/झुलसा रोग प्रसार चेतावनी (${currentHumidity}% नमी)`,
        gu: `અતિશય ભેજ અને ફૂગ/સુકારો રોગ ફેલાવાની ચેતવણી (${currentHumidity}% ભેજ)`,
        mr: `जास्त आर्द्रता आणि बुरशीजन्य करपा रोग इशारा (${currentHumidity}% आर्द्रता)`,
      },
      message: {
        en: `Prolonged atmospheric moisture (${highHumidityHours} hours over 82% humidity) provides optimal conditions for Late Blight, Downy Mildew, and Anthracnose fungal sporulation.`,
        hi: `लगातार उच्च आर्द्रता से खेतों में झुलसा, डाउनी मिल्ड्यू और फफूंद तेजी से फैलने की अनुकूल परिस्थितियां बन गई हैं।`,
        gu: `સતત ઊંચો ભેજ રહેવાથી ટામેટા-બટાટામાં પાછોતરો સુકારો, ચરમી અને ફૂગના રોગો ઝડપથી ફેલાવાની સંભાવના છે.`,
        mr: `हवेत दीर्घकाळ जास्त ओलावा राहिल्यामुळे करपा, भुरी आणि डाऊनी मिल्ड्यू रोगाचे बीजाणू वेगाने पसरू शकतात.`,
      },
      recommendedAction: {
        en: "Apply preventative contact fungicide spray (Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 3g/L). Avoid overhead sprinkler irrigation and reduce nitrogen top-dressing.",
        hi: "रोकथाम के लिए मैंकोजेब (2.5 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड का छिड़काव करें। यूरिया का अधिक प्रयोग न करें।",
        gu: "રોગચાળો અટકાવવા મેન્કોઝેબ 75% (2.5 ગ્રામ/લિટર) અથવા કોપર ઓક્સીક્લોરાઇડનો છંટકાવ કરો. સ્પ્રિંકલર પિયત ટાળો.",
        mr: "प्रतिबंधात्मक उपाय म्हणून मॅन्कोझेब (2.5 ग्रॅم/लिटर) किंवा कॉपर ऑक्सिक्लोराईडची फवारणी करा. युरियाचा अतिरेक टाळा.",
      },
    });
  }

  // 3. HEAVY RAINFALL & SPRAY DELAY ALERT (Davaai aur Khaad bahaav)
  const next2DaysRain = (daily.precipitation_sum || []).slice(0, 2);
  const maxRainMm = Math.max(...next2DaysRain, 0);
  const next2DaysProb = (daily.precipitation_probability_max || []).slice(0, 2);
  const maxRainProb = Math.max(...next2DaysProb, 0);

  if (maxRainMm >= 15 || maxRainProb >= 65) {
    alerts.push({
      id: "alert_rain_spray_delay",
      type: "spray_delay_rain",
      severity: maxRainMm >= 30 ? "high" : "medium",
      metric: `${maxRainMm} mm rain (${maxRainProb}% chance)`,
      vulnerableCrops: cropNames.length > 0 ? activeCrops.map((c) => c.cropName) : ["All Crops"],
      title: {
        en: `Heavy Rainfall Expected — Postpone Chemical Spraying (${maxRainMm} mm)`,
        hi: `भारी बारिश की संभावना — कीटनाशक छिड़काव स्थगित करें (${maxRainMm} मिमी)`,
        gu: `ભારે વરસાદની આગાહી — દવાનો છંટકાવ મોકૂફ રાખો (${maxRainMm} મીમી)`,
        mr: `मुसळधार पावसाचा अंदाज — कीटकनाशक फवारणी पुढे ढकला (${maxRainMm} मिमी)`,
      },
      message: {
        en: `Forecast predicts ${maxRainMm} mm precipitation with a ${maxRainProb}% likelihood. Chemical sprays and broadcast fertilizers applied now will wash off and leach into subsoil.`,
        hi: `${maxRainMm} मिमी बारिश होने की ${maxRainProb}% संभावना है। अभी किया गया कोई भी छिड़काव या यूरिया का बुरकाव पानी में बहकर व्यर्थ हो जाएगा।`,
        gu: `આગામી 48 કલાકમાં ${maxRainMm} મીમી વરસાદ પડવાની ${maxRainProb}% શક્યતા છે. અત્યારે કરેલો દવાનો છંટકાવ કે ખાતર ધોવાઈ જશે.`,
        mr: `पुढील 48 तासांत ${maxRainMm} मिमी पाऊस पडण्याची ${maxRainProb}% शक्यता आहे. आत्ता केलेली फवारणी आणि खते वाहून जाऊन वाया जातील.`,
      },
      recommendedAction: {
        en: "Immediately postpone all foliar sprays and urea applications for 48 hours. Open drainage furrows at the field tail to prevent water stagnation and root rot.",
        hi: "अगले 48 घंटों के लिए सभी छिड़काव और यूरिया टाल दें। खेत से अतिरिक्त पानी निकालने के लिए निकास नाली साफ रखें।",
        gu: "આગામી 48 કલાક માટે કોઈ પણ છંટકાવ કરવો નહીં. ખેતરમાં પાણી ભરાઈ ન રહે તે માટે નિકાલની નીકો સાફ કરો.",
        mr: "पुढील 48 तास फवारणी आणि युरिया देणे थांबवा. शेतात पाणी साचू नये म्हणून निचरा चर उघडा ठेवा.",
      },
    });
  }

  // 4. HEATWAVE & DROUGHT STRESS ALERT (Loo / Garmi)
  const maxTemps = daily.temperature_2m_max || [];
  const peakMaxTemp = Math.max(...maxTemps.slice(0, 3));

  if (peakMaxTemp >= 38.0) {
    const vulnerable = activeCrops
      .filter((c) => {
        const name = (c.cropName || "").toLowerCase();
        return ["tomato", "cotton", "vegetable", "chilli", "soybean", "groundnut"].some((v) =>
          name.includes(v)
        );
      })
      .map((c) => c.cropName);

    alerts.push({
      id: "alert_heatwave",
      type: "heatwave_stress",
      severity: peakMaxTemp >= 42.0 ? "high" : "medium",
      metric: `${peakMaxTemp}°C Max Temp`,
      vulnerableCrops: vulnerable.length > 0 ? vulnerable : ["Vegetables", "Cotton", "Pulses"],
      title: {
        en: `Heatwave & Evaporation Warning (${peakMaxTemp}°C)`,
        hi: `तीव्र गर्मी व लू की चेतावनी (${peakMaxTemp}°C)`,
        gu: `તીવ્ર ગરમી અને હીટવેવની ચેતવણી (${peakMaxTemp}°C)`,
        mr: `उष्णतेची तीव्र लाट इशारा (${peakMaxTemp}°C)`,
      },
      message: {
        en: `Temperatures reaching up to ${peakMaxTemp}°C will cause rapid moisture loss, flower abortion, and pollen sterility in standing crops.`,
        hi: `तापमान ${peakMaxTemp}°C तक पहुंचने से फूलों के झड़ने और मिट्टी में नमी की तीव्र कमी का खतरा बढ़ जाता है।`,
        gu: `તાપમાન ${peakMaxTemp}°C સુધી પહોંચવાથી પાકમાં ફૂલ ખરી પડવાની અને જમીનમાંથી ભેજ ઝડપથી ઊડી જવાની સમસ્યા થશે.`,
        mr: `तापमान ${peakMaxTemp}°C पर्यंत वाढल्यामुळे फुलगळती आणि पिकांमध्ये पाण्याचा तीव्र ताण निर्माण होऊ शकतो.`,
      },
      recommendedAction: {
        en: "Schedule light drip irrigation during early dawn (5:00 AM - 8:00 AM) or after sunset. Apply straw mulching around root zones to suppress soil evaporation.",
        hi: "सिंचाई केवल सुबह 5 से 8 बजे या सूर्यास्त के बाद करें। नमी बचाने के लिए फसलों के चारों तरफ भूसे या घास की पलवार (मल्चिंग) करें।",
        gu: "પિયત વહેલી સવારે અથવા સૂર્યાસ્ત પછી જ આપો. જમીનમાં ભેજ જાળવી રાખવા માટે કચરાનું મલ્ચિંગ કરો.",
        mr: "पाणी पहाटे किंवा सूर्यास्तानंतरच द्या. जमिनीतील ओलावा टिकवण्यासाठी पिकांच्या मुळाशी आच्छादन करा.",
      },
    });
  }

  // 5. HIGH WIND SPRAY DRIFT ALERT
  const windSpeeds = daily.wind_speed_10m_max || [];
  const maxWindKmH = Math.max(...windSpeeds.slice(0, 2), current?.windspeed || 0);

  if (maxWindKmH >= 22.0) {
    alerts.push({
      id: "alert_wind_drift",
      type: "wind_drift",
      severity: "low",
      metric: `${maxWindKmH} km/h Wind`,
      vulnerableCrops: ["All Foliar Sprays"],
      title: {
        en: `High Wind Spray Drift Alert (${maxWindKmH} km/h)`,
        hi: `तेज़ हवा व स्प्रे बहाव चेतावनी (${maxWindKmH} किमी/घंटा)`,
        gu: `પવનની તેજ ગતિ — દવા ઉડી જવાની ચેતવણી (${maxWindKmH} કિમી/કલાક)`,
        mr: `जोरदार वाऱ्यामुळे फवारणी वाहून जाण्याचा इशारा (${maxWindKmH} किमी/तास)`,
      },
      message: {
        en: `Strong winds up to ${maxWindKmH} km/h will cause high droplet drift away from target foliage and increase chemical wastage.`,
        hi: `तेज़ हवा (${maxWindKmH} किमी/घंटा) चलने से दवा पौधों पर टिकने के बजाय उड़ जाएगी और असर नहीं होगा।`,
        gu: `પવનની ગતિ ${maxWindKmH} કિમી/કલાક હોવાથી છંટકાવ કરેલી દવા લક્ષિત છોડ પર બેસવાને બદલે ઉડી જશે.`,
        mr: `वाऱ्याचा वेग ${maxWindKmH} किमी/तास असल्यामुळे फवारणी पिकांवर न बसता हवेत उडून वाया जाईल.`,
      },
      recommendedAction: {
        en: "Wait for wind speeds to drop below 12 km/h before spraying. Use anti-drift hollow cone nozzles if urgent.",
        hi: "हवा की गति 12 किमी/घंटा से कम होने तक छिड़काव रोकें।",
        gu: "પવનની ઝડપ 12 કિમીથી ઓછી થાય ત્યાં સુધી છંટકાવ કરવો નહીં.",
        mr: "वाऱ्याचा वेग 12 किमी पेक्षा कमी होईपर्यंत फवारणी करणे टाळा.",
      },
    });
  }

  return alerts;
}
