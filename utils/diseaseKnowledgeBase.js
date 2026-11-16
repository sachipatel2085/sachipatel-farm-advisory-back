/**
 * Universal Agricultural Plant Disease Knowledge Base
 * Diseases are categorized by disease name (without crop-specific prefixes)
 * and mapped across MULTIPLE susceptible crops.
 * Standardized for Indian agricultural conditions and 15L knapsack spray pumps.
 */

export const commonDiseaseAdvisories = [
  // ==========================================
  // 1. EARLY BLIGHT
  // ==========================================
  {
    diseaseKey: "early_blight",
    name: "Early Blight",
    scientificName: "Alternaria solani / Alternaria alternata",
    crops: ["Tomato", "Potato", "Eggplant (Brinjal)", "Bell Pepper", "Chilli"],
    crop: "Tomato",
    category: "fungal",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "Vegetative to Fruiting",
    symptoms: [
      "Dark brown to black concentric circular rings ('target-board' pattern) on older lower leaves.",
      "Yellow chlorotic halo surrounding expanding lesions.",
      "Lower leaves turn yellow, dry up, and drop prematurely (bottom-up defoliation).",
      "Sunken dark cankers on stems at or near the soil line.",
      "Dark, leathery, sunken spots on mature fruit or tubers with dry corky decay beneath.",
    ],
    cause:
      "Fungal pathogen Alternaria species. Survives in crop residue, volunteer solanaceous weeds, and seeds. Favored by warm temperatures (24-29°C) with alternating heavy dew or rain followed by dry periods.",
    chemicalTreatment:
      "Spray Mancozeb 75% WP @ 35-40g per 15L pump, or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 15ml per 15L pump. In severe outbreaks, spray Chlorothalonil 75% WP @ 30g per 15L pump. Repeat at 10-12 day intervals.",
    organicSolution:
      "Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 10,000 ppm @ 45ml per 15L pump. Apply bio-agent Trichoderma viride @ 50g per 15L pump as a preventive foliar spray and root drench.",
    prevention:
      "Practice 2-3 year crop rotation away from solanaceous crops. Use certified disease-free seeds. Mulch soil to prevent soil splashing onto lower foliage. Water via drip irrigation to keep leaf canopy dry.",
    recommendedProducts: [
      {
        name: "Mancozeb 75% WP (Dithane M-45)",
        activeIngredient: "Mancozeb 75% WP",
        productType: "chemical",
        dosage: "35-40g per 15L pump",
        applicationNotes: "Preventative contact foliar spray.",
      },
      {
        name: "Amistar Top (Azoxystrobin + Difenoconazole)",
        activeIngredient: "Azoxystrobin + Difenoconazole",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Systemic curative spray for active lesions.",
      },
      {
        name: "Neem Oil 10,000 ppm",
        activeIngredient: "Azadirachtin",
        productType: "organic",
        dosage: "45ml per 15L pump",
        applicationNotes: "Early stage organic repellent and spore inhibitor.",
      },
    ],
    tags: [
      "early_blight",
      "early blight",
      "alternaria solani",
      "Tomato_Early_blight",
      "Potato___Early_blight",
      "target board spot",
      "alternaria",
    ],
  },

  // ==========================================
  // 2. LATE BLIGHT
  // ==========================================
  {
    diseaseKey: "late_blight",
    name: "Late Blight",
    scientificName: "Phytophthora infestans",
    crops: ["Tomato", "Potato", "Eggplant (Brinjal)", "Bell Pepper"],
    crop: "Tomato",
    category: "fungal",
    severity: "critical",
    isHealthy: false,
    stageOfOccurrence: "Any Stage (Cool, Humid / Foggy Weather)",
    symptoms: [
      "Irregular, water-soaked, dark brown to black lesions starting from leaf tips and margins.",
      "Delicate white fungal downy mold visible on the underside of leaves during morning hours or humid periods.",
      "Rapid water-soaked collapse of entire stems and petioles with a distinct rotting odor.",
      "Firm, dark golden-brown greasy lesions on green fruit, turning mushy and rot-prone; copper-colored dry rot on tubers.",
    ],
    cause:
      "Oomycete water mold Phytophthora infestans. Spreads with explosive speed during cool (12-22°C), overcast, cloudy, foggy weather with relative humidity above 90%. Can destroy an entire field within 48-72 hours.",
    chemicalTreatment:
      "Immediately spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) @ 35g per 15L pump, or Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 35g per 15L pump, or Dimethomorph 50% WP @ 15g per 15L pump. Alternate fungicides to prevent resistance.",
    organicSolution:
      "Spray Copper Oxychloride 50% WP @ 35-40g per 15L pump or Bordeaux Mixture (1%). Apply bio-fungicide Bacillus subtilis or Trichoderma viride @ 50g per 15L pump preventatively before rain spells.",
    prevention:
      "Ensure wide plant spacing (60 x 45 cm) for air circulation. Avoid overhead sprinkler irrigation. Rogue out and safely bury heavily infected plants immediately. Build high soil ridges around potato tubers.",
    recommendedProducts: [
      {
        name: "Ridomil Gold (Metalaxyl + Mancozeb)",
        activeIngredient: "Metalaxyl-M 4% + Mancozeb 64% WP",
        productType: "chemical",
        dosage: "35g per 15L pump",
        applicationNotes: "Spray immediately upon first warning signs or high humidity.",
      },
      {
        name: "Cymoxanil + Mancozeb (Curzate)",
        activeIngredient: "Cymoxanil 8% + Mancozeb 64% WP",
        productType: "chemical",
        dosage: "35g per 15L pump",
        applicationNotes: "Penetrating curative action on stems and leaves.",
      },
      {
        name: "Copper Oxychloride 50% WP (Blitox)",
        activeIngredient: "Copper Oxychloride",
        productType: "organic",
        dosage: "40g per 15L pump",
        applicationNotes: "Broad-spectrum contact protective barrier.",
      },
    ],
    tags: [
      "late_blight",
      "late blight",
      "phytophthora infestans",
      "Tomato_Late_blight",
      "Potato___Late_blight",
      "water soaked rot",
      "blight",
    ],
  },

  // ==========================================
  // 3. POWDERY MILDEW
  // ==========================================
  {
    diseaseKey: "powdery_mildew",
    name: "Powdery Mildew",
    scientificName: "Erysiphe / Podosphaera / Leveillula / Oidium species",
    crops: [
      "Tomato",
      "Bell Pepper",
      "Chilli",
      "Cucumber",
      "Bottle Gourd",
      "Bitter Gourd",
      "Pea",
      "Okra",
      "Rose",
      "Grapes",
      "Watermelon",
      "Pumpkin",
    ],
    crop: "Tomato",
    category: "fungal",
    severity: "medium",
    isHealthy: false,
    stageOfOccurrence: "Vegetative to Maturity (Dry Days, Humid Nights)",
    symptoms: [
      "Distinctive white to grayish, talcum-powder-like fungal patches on the upper and lower surfaces of leaves and young stems.",
      "In early stages, spots look like dust or flour sprinkled across the leaf surface.",
      "Infected leaves gradually turn yellow, curl upward, become dry, papery, and drop prematurely.",
      "Reduced photosynthesis leading to stunted fruit growth and severe sunscald on exposed produce.",
    ],
    cause:
      "Obligate fungal pathogens (Erysiphaceae). Unlike Late Blight (which requires free water and fog), Powdery Mildew thrives in dry, warm daytime conditions (20-28°C) with high relative humidity at night, shaded canopies, and poor air movement.",
    chemicalTreatment:
      "Spray Hexaconazole 5% SC (Contaf) @ 25ml per 15L pump, or Penconazole 10% EC @ 10ml per 15L pump, or Difenoconazole 25% EC @ 15ml per 15L pump, or Tebuconazole 25.9% EC @ 15ml per 15L pump.",
    organicSolution:
      "Spray Wettable Sulphur 80% WDG (Sulfex) @ 35g per 15L pump. Alternatively, spray 10% Raw Cow Milk solution (1.5L milk in 15L pump) or Baking Soda (Potassium / Sodium Bicarbonate) @ 45g per 15L pump with a few drops of liquid soap as sticker.",
    prevention:
      "Ensure ample direct sunlight into the crop canopy. Prune crowded and overlapping branches. Avoid excessive nitrogen applications which produce lush, highly susceptible foliage.",
    recommendedProducts: [
      {
        name: "Contaf (Hexaconazole 5% SC)",
        activeIngredient: "Hexaconazole 5% SC",
        productType: "chemical",
        dosage: "25ml per 15L pump",
        applicationNotes: "Systemic triazole with quick curative action on powdery mildew.",
      },
      {
        name: "Sulfex (Wettable Sulphur 80% WDG)",
        activeIngredient: "Sulphur 80% WDG",
        productType: "organic",
        dosage: "35g per 15L pump",
        applicationNotes: "Organic contact barrier; avoid spraying during hot sun >32°C.",
      },
      {
        name: "Score (Difenoconazole 25% EC)",
        activeIngredient: "Difenoconazole",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Broad systemic translaminar protection.",
      },
    ],
    tags: [
      "powdery_mildew",
      "powdery mildew",
      "white powder on leaves",
      "erysiphe",
      "flour like spots",
      "leveillula",
      "oidium",
    ],
  },

  // ==========================================
  // 4. BACTERIAL SPOT
  // ==========================================
  {
    diseaseKey: "bacterial_spot",
    name: "Bacterial Spot",
    scientificName: "Xanthomonas perforans / campestris / vesicatoria",
    crops: ["Tomato", "Bell Pepper", "Chilli", "Potato"],
    crop: "Tomato",
    category: "bacterial",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "Vegetative to Fruit Setting",
    symptoms: [
      "Small (1-3mm), circular to angular, dark brown to black water-soaked spots on leaves.",
      "Leaf spots often appear greasy and may develop a distinct yellow halo.",
      "Severely spotted leaves turn yellow, scorch, and drop off, causing ragged canopy defoliation.",
      "Blister-like, raised, rough scabs on fruit with cracked centers.",
    ],
    cause:
      "Bacterium Xanthomonas species. Spread by splashing rain, dew, overhead sprinklers, and contaminated farm tools. Thrives in warm (25-30°C) and rainy/humid weather.",
    chemicalTreatment:
      "Spray Streptocycline (Streptomycin sulphate + Tetracycline) @ 2g per 15L pump mixed with Copper Oxychloride 50% WP @ 35g per 15L pump. Repeat after 7-10 days if rains continue.",
    organicSolution:
      "Seed treatment with hot water (50°C for 25 minutes) before sowing. Spray Pseudomonas fluorescens @ 40g per 15L pump or 5% Fermented Butter Milk / Cow Dung Slurry as bio-bactericide.",
    prevention:
      "Use certified pathogen-free hybrid seeds. Avoid working in or pruning wet foliage. Sterilize pruning shears with 10% sodium hypochlorite solution. Practice 3-year crop rotation.",
    recommendedProducts: [
      {
        name: "Streptocycline",
        activeIngredient: "Streptomycin Sulphate 90% + Tetracycline Hydrochloride 10%",
        productType: "chemical",
        dosage: "2g per 15L pump",
        applicationNotes: "Mix with Copper Oxychloride for bactericidal synergy.",
      },
      {
        name: "Copper Hydroxide (Kocide 77% WP)",
        activeIngredient: "Copper Hydroxide",
        productType: "chemical",
        dosage: "30g per 15L pump",
        applicationNotes: "Bactericidal surface protective barrier.",
      },
    ],
    tags: [
      "bacterial_spot",
      "bacterial spot",
      "Tomato_Bacterial_spot",
      "Pepper__bell___Bacterial_spot",
      "xanthomonas",
      "bacterial scab",
    ],
  },

  // ==========================================
  // 5. YELLOW LEAF CURL VIRUS
  // ==========================================
  {
    diseaseKey: "leaf_curl_virus",
    name: "Yellow Leaf Curl Virus",
    scientificName: "Begomovirus (transmitted by Bemisia tabaci)",
    crops: ["Tomato", "Chilli", "Bell Pepper", "Cotton", "Papaya", "Okra"],
    crop: "Tomato",
    category: "viral",
    severity: "critical",
    isHealthy: false,
    stageOfOccurrence: "Seedling to Vegetative",
    symptoms: [
      "Severe upward curling and cupping of leaf margins with puckered leaves.",
      "Marked interveinal chlorosis (yellowing) of leaves, particularly on younger growth.",
      "Severe stunting, bushy erect appearance, and shortening of internodes.",
      "Blossom drop; plants infected early produce zero marketable fruit.",
    ],
    cause:
      "Begomovirus transmitted exclusively by the Whitefly (Bemisia tabaci) and aphids. Not transmitted by mechanical touch. Early infection causes 90-100% crop loss.",
    chemicalTreatment:
      "Viruses cannot be cured chemically once inside plant tissue! Manage the insect vector immediately: Spray Diafenthiuron 50% WP @ 20g per 15L pump, or Pyriproxyfen 10% EC @ 25ml per 15L pump, or Acetamiprid 20% SP @ 6g per 15L pump, or Flonicamid 50% WG @ 6g per 15L pump.",
    organicSolution:
      "Install 15-20 Yellow Sticky Traps per acre at canopy level. Spray Neem Oil 10,000 ppm @ 45ml per 15L pump. Spray Verticillium lecanii (bio-insecticide) @ 50g per 15L pump during evening hours.",
    prevention:
      "Raise nursery seedlings under 40-mesh insect-proof nylon net. Grow border rows of 2-3 lines of tall maize or sorghum as a physical barrier. Rogue out and burn initial infected dwarf plants.",
    recommendedProducts: [
      {
        name: "Pegasus (Diafenthiuron 50% WP)",
        activeIngredient: "Diafenthiuron 50% WP",
        productType: "chemical",
        dosage: "20g per 15L pump",
        applicationNotes: "Knockdown of adult whitefly and nymphs.",
      },
      {
        name: "Yellow Sticky Traps",
        activeIngredient: "Non-chemical physical trap",
        productType: "tool",
        dosage: "15-20 traps / acre",
        applicationNotes: "Attracts and monitors whitefly populations.",
      },
    ],
    tags: [
      "leaf_curl_virus",
      "leaf curl virus",
      "Tomato__Tomato_YellowLeaf__Curl_Virus",
      "tolcv",
      "whitefly virus",
      "cotton leaf curl",
      "chilli leaf curl",
      "begomovirus",
    ],
  },

  // ==========================================
  // 6. TWO-SPOTTED SPIDER MITES
  // ==========================================
  {
    diseaseKey: "spider_mites",
    name: "Two-Spotted Spider Mites",
    scientificName: "Tetranychus urticae",
    crops: [
      "Tomato",
      "Chilli",
      "Bell Pepper",
      "Cotton",
      "Eggplant (Brinjal)",
      "Okra",
      "Cucumber",
      "Rose",
    ],
    crop: "Tomato",
    category: "pest",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "Vegetative to Harvest (Hot, Dry Weather)",
    symptoms: [
      "Fine yellow stippling (tiny pale speckled dots) across the upper leaf surface.",
      "Leaves take on a bronze, dusty, bleached or scorched appearance.",
      "Fine silken webbing spun on the undersides of leaves and growing tips.",
      "Complete defoliation and stunted fruit growth under severe infestation.",
    ],
    cause:
      "Microscopic arachnid mites Tetranychus urticae. Reproduce rapidly during hot (>30°C), dry, drought-stressed, and dusty field conditions.",
    chemicalTreatment:
      "Spray targeted acaricide: Spiromesifen 22.9% SC (Oberon) @ 15ml per 15L pump, or Abamectin 1.9% EC @ 10ml per 15L pump, or Propargite 57% EC @ 30ml per 15L pump. Ensure thorough spray underneath leaves.",
    organicSolution:
      "Spray Micronized Wettable Sulphur 80% WDG @ 35g per 15L pump. Spray Neem Oil 10,000 ppm @ 50ml per 15L pump with detergent sticker.",
    prevention:
      "Prevent water stress; maintain adequate soil moisture. Avoid excessive nitrogen fertilizer.",
    recommendedProducts: [
      {
        name: "Oberon (Spiromesifen 22.9% SC)",
        activeIngredient: "Spiromesifen",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Acts against all mite developmental stages including eggs.",
      },
      {
        name: "Vertimec (Abamectin 1.9% EC)",
        activeIngredient: "Abamectin",
        productType: "chemical",
        dosage: "10ml per 15L pump",
        applicationNotes: "Deep translaminar mite control inside leaf tissue.",
      },
    ],
    tags: [
      "spider_mites",
      "spider mites",
      "Tomato_Spider_mites_Two_spotted_spider_mite",
      "tetranychus urticae",
      "red spider mite",
      "mites",
    ],
  },

  // ==========================================
  // 7. ANTHRACNOSE & DIE-BACK
  // ==========================================
  {
    diseaseKey: "anthracnose",
    name: "Anthracnose & Die-Back (Fruit Rot)",
    scientificName: "Colletotrichum capsici / gloeosporioides / acutatum",
    crops: ["Chilli", "Bell Pepper", "Tomato", "Mango", "Beans", "Cotton"],
    crop: "Chilli",
    category: "fungal",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "Flowering & Fruit Ripening",
    symptoms: [
      "Die-back: Tender branches dry up from the tip downwards, turning bleached straw-colored with black dots.",
      "Fruit rot: Circular, sunken, dark water-soaked lesions with concentric rings of salmon-pink or black spore masses.",
      "Ripe fruits rot, shrivel, and drop prematurely.",
    ],
    cause:
      "Fungus Colletotrichum species. Seed-borne and soil-borne. Spreads rapidly during warm (28-30°C) humid spells, monsoon showers, and overhead watering.",
    chemicalTreatment:
      "Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) @ 15ml per 15L pump, or Tebuconazole 50% + Trifloxystrobin 25% WG (Nativo) @ 10g per 15L pump, or Copper Oxychloride 50% WP @ 35g per 15L pump.",
    organicSolution:
      "Seed treatment with Trichoderma viride @ 10g/kg seed. Spray 5% Neem Seed Kernel Extract (NSKE) or Panchagavya (3%) at 10-day intervals.",
    prevention:
      "Prune and destroy dried infected twigs. Avoid harvesting fruit when wet. Use certified pathogen-free seeds. Ensure good field drainage.",
    recommendedProducts: [
      {
        name: "Nativo (Tebuconazole + Trifloxystrobin)",
        activeIngredient: "Tebuconazole 50% + Trifloxystrobin 25% WG",
        productType: "chemical",
        dosage: "10g per 15L pump",
        applicationNotes: "Premium dual-action systemic fungicide for fruit rot.",
      },
    ],
    tags: [
      "anthracnose",
      "anthracnose & die-back",
      "colletotrichum",
      "die-back",
      "fruit rot",
      "chilli anthracnose",
    ],
  },

  // ==========================================
  // 8. RUST (STRIPE / YELLOW / LEAF RUST)
  // ==========================================
  {
    diseaseKey: "rust",
    name: "Rust (Stripe, Yellow & Leaf Rust)",
    scientificName: "Puccinia striiformis / Puccinia triticina",
    crops: ["Wheat", "Barley", "Mustard", "Beans", "Soybean"],
    crop: "Wheat",
    category: "fungal",
    severity: "critical",
    isHealthy: false,
    stageOfOccurrence: "Tillering to Grain Filling (Cool Weather)",
    symptoms: [
      "Bright yellow, orange, or reddish-brown powdery pustules arranged in long parallel stripes along leaf veins.",
      "Yellow powder rubs off easily onto fingers when brushing across the canopy.",
      "Infected leaves dry out, turn brown, and curl, causing severe grain shrivelling.",
    ],
    cause:
      "Obligate fungus Puccinia species. Thrives in cool (10-18°C) humid winter conditions with morning dews or fog. Spores are wind-borne over vast geographical regions.",
    chemicalTreatment:
      "Immediately spray Propiconazole 25% EC (Tilt) @ 15ml per 15L pump or Tebuconazole 25.9% EC @ 15ml per 15L pump upon initial spotting. In widespread outbreaks, repeat spray after 15 days.",
    organicSolution:
      "Seed treatment with Trichoderma viride @ 5g/kg seed. Spray 5% Fermented Butter Milk or Cow Urine solution as a biological deterrent at first sign.",
    prevention:
      "Sow rust-resistant varieties. Avoid excessive nitrogen fertilizer. Timely sowing.",
    recommendedProducts: [
      {
        name: "Tilt (Propiconazole 25% EC)",
        activeIngredient: "Propiconazole 25% EC",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Gold standard systemic triazole cure for rusts.",
      },
    ],
    tags: [
      "rust",
      "wheat rust",
      "yellow rust",
      "stripe rust",
      "wheat_yellow_rust",
      "puccinia",
    ],
  },

  // ==========================================
  // 9. BLAST (LEAF, COLLAR & NECK BLAST)
  // ==========================================
  {
    diseaseKey: "blast",
    name: "Blast (Leaf, Collar & Neck Blast)",
    scientificName: "Magnaporthe oryzae (Pyricularia oryzae)",
    crops: ["Rice", "Finger Millet (Ragi)", "Wheat"],
    crop: "Rice",
    category: "fungal",
    severity: "critical",
    isHealthy: false,
    stageOfOccurrence: "Tillering to Panicle Heading",
    symptoms: [
      "Spindle-shaped / diamond-shaped / eye-shaped lesions on leaves with gray-white centers and reddish-brown borders.",
      "Neck blast: Panicle node turns blackish-brown and rots, causing the entire head of grain to break and lodge.",
      "White, empty, erect panicles ('chaffy grains') with total grain filling failure.",
    ],
    cause:
      "Ascomycete fungus Magnaporthe oryzae. Thrives in humid conditions (>90% RH), cloudy days, cool night temperatures (18-24°C), and fields receiving excessive nitrogen fertilizer.",
    chemicalTreatment:
      "Spray Tricyclazole 75% WP (Baan) @ 15g per 15L pump, or Isoprothiolane 40% EC @ 30ml per 15L pump, or Kasugamycin 3% SL @ 35ml per 15L pump.",
    organicSolution:
      "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed. Spray fermented panchagavya or neem-cow urine extract @ 45ml per 15L pump.",
    prevention:
      "Avoid excessive and late top-dressing of urea nitrogen. Maintain optimal water level. Plant blast-resistant paddy varieties.",
    recommendedProducts: [
      {
        name: "Baan (Tricyclazole 75% WP)",
        activeIngredient: "Tricyclazole 75% WP",
        productType: "chemical",
        dosage: "15g per 15L pump",
        applicationNotes: "Most effective preventive and systemic cure for blast.",
      },
    ],
    tags: [
      "blast",
      "rice blast",
      "rice_blast",
      "magnaporthe oryzae",
      "neck blast",
      "spindle spot",
    ],
  },

  // ==========================================
  // 10. SEPTORIA LEAF SPOT
  // ==========================================
  {
    diseaseKey: "septoria_leaf_spot",
    name: "Septoria Leaf Spot",
    scientificName: "Septoria lycopersici / Septoria species",
    crops: ["Tomato", "Potato", "Eggplant (Brinjal)"],
    crop: "Tomato",
    category: "fungal",
    severity: "medium",
    isHealthy: false,
    stageOfOccurrence: "Vegetative to Harvest",
    symptoms: [
      "Numerous tiny (2-4mm), circular spots with grayish-white centers and distinct dark brown margins.",
      "Tiny black specks (pycnidia fruiting bodies) visible inside older leaf spots.",
      "Heavily infected leaves turn yellow, curl up, dry out, and drop off starting from the bottom up.",
    ],
    cause:
      "Fungus Septoria species. Spores splash from soil and old plant debris during rain showers or overhead irrigation. Thrives between 20-26°C with prolonged leaf wetness.",
    chemicalTreatment:
      "Spray Chlorothalonil 75% WP (Kavach) @ 30g per 15L pump, or Mancozeb 75% WP @ 35g per 15L pump, or Pyraclostrobin 20% WG @ 15g per 15L pump.",
    organicSolution:
      "Spray Copper Oxychloride 50% WP @ 35g per 15L pump. Apply mulch under plants to create a barrier preventing spores from splashing up from soil.",
    prevention:
      "Prune lowest 30 cm of branches from ground level once plants are established. Rotate crops every 3 years. Stake plants upright.",
    recommendedProducts: [
      {
        name: "Kavach (Chlorothalonil 75% WP)",
        activeIngredient: "Chlorothalonil",
        productType: "chemical",
        dosage: "30g per 15L pump",
        applicationNotes: "Multi-site protective fungicide adhering strongly to leaves.",
      },
    ],
    tags: [
      "septoria_leaf_spot",
      "septoria leaf spot",
      "Tomato_Septoria_leaf_spot",
      "septoria",
    ],
  },

  // ==========================================
  // 11. LEAF MOLD
  // ==========================================
  {
    diseaseKey: "leaf_mold",
    name: "Leaf Mold",
    scientificName: "Passalora fulva (Cladosporium fulvum)",
    crops: ["Tomato", "Eggplant (Brinjal)", "Bell Pepper"],
    crop: "Tomato",
    category: "fungal",
    severity: "medium",
    isHealthy: false,
    stageOfOccurrence: "Flowering & Fruiting (High Humidity / Polyhouse)",
    symptoms: [
      "Pale green to yellowish diffuse spots with indefinite borders on the upper leaf surface.",
      "Velvety olive-green to purple-brown mold growth on the corresponding lower surface of leaves.",
      "Infected leaves curl, wither, turn dry brown, and drop prematurely.",
    ],
    cause:
      "Fungus Passalora fulva. Primarily occurs in polyhouses, greenhouses, or densely planted fields where relative humidity exceeds 85% and temperature is between 20-25°C.",
    chemicalTreatment:
      "Spray Difenoconazole 25% EC @ 15ml per 15L pump, or Azoxystrobin 23% SC @ 15ml per 15L pump, or Mancozeb 75% WP @ 35g per 15L pump.",
    organicSolution:
      "Spray Baking Soda @ 45g + Horticultural Soap (10ml) per 15L pump. Improve ventilation.",
    prevention:
      "Improve greenhouse ventilation. Prune suckers and bottom leaves to allow sunlight into canopy. Keep humidity below 80%.",
    recommendedProducts: [
      {
        name: "Score (Difenoconazole 25% EC)",
        activeIngredient: "Difenoconazole",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Systemic translaminar action on both leaf surfaces.",
      },
    ],
    tags: [
      "leaf_mold",
      "leaf mold",
      "Tomato_Leaf_Mold",
      "passalora fulva",
      "cladosporium",
    ],
  },

  // ==========================================
  // 12. TARGET SPOT
  // ==========================================
  {
    diseaseKey: "target_spot",
    name: "Target Spot",
    scientificName: "Corynespora cassiicola",
    crops: ["Tomato", "Cucumber", "Cotton", "Soybean", "Papaya"],
    crop: "Tomato",
    category: "fungal",
    severity: "medium",
    isHealthy: false,
    stageOfOccurrence: "Flowering & Fruit Development",
    symptoms: [
      "Small, pinpoint, water-soaked brown lesions on leaves enlarging up to 10mm.",
      "Spots have tan or pale brown centers with dark brown margins, resembling a target.",
      "Lesions on green and ripe fruit are circular, pitted, sunken, and dark brown.",
    ],
    cause:
      "Fungus Corynespora cassiicola. Favored by warm temperatures (25-32°C) combined with prolonged leaf wetness, heavy dews, or high humidity.",
    chemicalTreatment:
      "Spray Azoxystrobin 23% SC @ 15ml per 15L pump, or Pyraclostrobin 20% WG @ 15g per 15L pump, or Mancozeb 75% WP @ 35g per 15L pump.",
    organicSolution:
      "Foliar spray with Copper Hydroxide @ 30g per 15L pump or Bacillus amyloliquefaciens @ 40g per 15L pump.",
    prevention:
      "Stake and prune plants to improve air movement. Maintain clean row spacing. Destroy crop residues post-harvest.",
    recommendedProducts: [
      {
        name: "Amistar (Azoxystrobin 23% SC)",
        activeIngredient: "Azoxystrobin",
        productType: "chemical",
        dosage: "15ml per 15L pump",
        applicationNotes: "Broad-spectrum strobilurin targeting Corynespora leaf spot.",
      },
    ],
    tags: [
      "target_spot",
      "target spot",
      "Tomato__Target_Spot",
      "corynespora cassiicola",
    ],
  },

  // ==========================================
  // 13. MOSAIC VIRUS
  // ==========================================
  {
    diseaseKey: "mosaic_virus",
    name: "Mosaic Virus (ToMV / TMV / CMV)",
    scientificName: "Tobamovirus / Cucumovirus species",
    crops: ["Tomato", "Potato", "Chilli", "Bell Pepper", "Cucumber", "Tobacco"],
    crop: "Tomato",
    category: "viral",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "All Growth Stages",
    symptoms: [
      "Mottling of leaves with alternating light green and dark green mosaic patches.",
      "Blistering, distortion, and 'shoestring' narrowing of leaves (fern-like leaf).",
      "Stunted plant growth and delayed flowering.",
      "Internal browning and uneven ripening of fruit pulp.",
    ],
    cause:
      "Tobamovirus transmitted mechanically via hands, clothing, pruning tools, and tobacco residue from smokers, as well as aphid vectors (CMV).",
    chemicalTreatment:
      "No chemical viricide exists. Remove and incinerate infected plants immediately. Disinfect hands and tools in 20% nonfat dry milk solution or 10% TSP before touching healthy plants.",
    organicSolution:
      "Foliar spray with skimmed cow milk solution (10% milk in water, 1.5L milk per 15L pump) to coat and neutralize mechanical transmission. Apply seaweed extract to boost plant immune defense.",
    prevention:
      "Prohibit smoking, bidi, or tobacco use inside vegetable fields. Use certified mosaic-resistant varieties.",
    recommendedProducts: [
      {
        name: "Seaweed Bio-Stimulant",
        activeIngredient: "Ascophyllum nodosum extract",
        productType: "organic",
        dosage: "35ml per 15L pump",
        applicationNotes: "Boosts endogenous plant immunity against stress.",
      },
    ],
    tags: [
      "mosaic_virus",
      "mosaic virus",
      "Tomato__Tomato_mosaic_virus",
      "tomv",
      "tmv",
      "cucumber mosaic virus",
    ],
  },

  // ==========================================
  // 14. WHITE RUST (BLISTER SMUT)
  // ==========================================
  {
    diseaseKey: "white_rust",
    name: "White Rust (Blister Smut)",
    scientificName: "Albugo candida",
    crops: ["Mustard", "Radish", "Cabbage", "Cauliflower", "Turnip"],
    crop: "Mustard",
    category: "fungal",
    severity: "high",
    isHealthy: false,
    stageOfOccurrence: "Flowering to Pod Formation",
    symptoms: [
      "White or creamy-white raised pustules (blisters) on the underside of leaves.",
      "Floral malformation: Swollen, deformed, sterile flower heads resembling a 'staghead' with zero seed set.",
      "Browning and target spots on siliqua pods.",
    ],
    cause:
      "Oomycete Albugo candida. Cool, moist, foggy weather (12-18°C) with morning dew. Overwinters on weed hosts and previous crop debris.",
    chemicalTreatment:
      "Spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) @ 35g per 15L pump at first pustule emergence. Follow with Mancozeb 75% WP @ 35g per 15L pump 15 days later.",
    organicSolution:
      "Seed treatment with Trichoderma viride @ 5g/kg seed. Spray Copper Oxychloride 50% WP @ 35g per 15L pump.",
    prevention:
      "Sow mustard timely before mid-October to escape peak January fog. Maintain spacing. Rogue out 'staghead' floral malformations promptly.",
    recommendedProducts: [
      {
        name: "Ridomil Gold",
        activeIngredient: "Metalaxyl 8% + Mancozeb 64% WP",
        productType: "chemical",
        dosage: "35g per 15L pump",
        applicationNotes: "Systemic cure for white rust and downy mildew complex.",
      },
    ],
    tags: [
      "white_rust",
      "white rust",
      "mustard white rust",
      "albugo candida",
      "staghead",
    ],
  },

  // ==========================================
  // 15. HEALTHY PLANT
  // ==========================================
  {
    diseaseKey: "healthy_plant",
    name: "Healthy Plant (Optimal Care & Maintenance)",
    scientificName: "Plantae (Normal Vigorous Condition)",
    crops: [
      "All Crops",
      "Tomato",
      "Potato",
      "Bell Pepper",
      "Chilli",
      "Wheat",
      "Rice",
      "Cotton",
      "Mustard",
      "Cucumber",
    ],
    crop: "All Crops",
    category: "healthy",
    severity: "none",
    isHealthy: true,
    stageOfOccurrence: "Active Growth",
    symptoms: [
      "Vibrant green uniform foliage without leaf spots, chlorosis, or necrotic margins.",
      "Sturdy erect stems with healthy branching and active root growth.",
      "Normal flower bud formation, high pollen fertility, and healthy fruit set.",
      "No pest webbing, insect tunneling, or powdery/downy fungal molds.",
    ],
    cause:
      "Plant is healthy and flourishing! Maintain balanced nutrition, proactive scouting, and preventive cultural care.",
    chemicalTreatment:
      "No therapeutic chemical fungicide or pesticide required. Continue scheduled preventive micronutrient foliar sprays.",
    organicSolution:
      "Foliar spray with Water-Soluble 19:19:19 @ 45g per 15L pump + Chelated Micronutrient Mixture @ 20g per 15L pump during vegetative stage. During flowering, spray 0:52:34 @ 50g + Soluble Boron 20% @ 15g per 15L pump to promote heavy fruit set.",
    prevention:
      "Maintain consistent, light drip irrigation; avoid drought stress followed by flooding to prevent fruit cracking and blossom-end rot. Regularly prune lower sucker shoots for canopy ventilation.",
    recommendedProducts: [
      {
        name: "Water Soluble NPK 19:19:19",
        activeIngredient: "Balanced NPK",
        productType: "nutrient",
        dosage: "45-50g per 15L pump",
        applicationNotes: "Supports steady vegetative development.",
      },
      {
        name: "Foliar 0:52:34 (MKP) + Boron 20%",
        activeIngredient: "Monopotassium Phosphate + Boron",
        productType: "nutrient",
        dosage: "50g MKP + 15g Boron per 15L pump",
        applicationNotes: "Spray during 30-40% flowering to boost fruit set.",
      },
    ],
    tags: [
      "healthy",
      "healthy_plant",
      "Tomato_healthy",
      "Potato___healthy",
      "Pepper__bell___healthy",
      "healthy crop",
      "optimal growth",
    ],
  },
];
