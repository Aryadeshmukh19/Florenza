/* ──────────────────────────────────────────────────────────────
   FLORENZA — CONTENT
   Source of truth: "for website.pdf" (founder's website content).
   Nothing here is invented: where the PDF gives no value, the field
   is left out and the UI hides it.
   ────────────────────────────────────────────────────────────── */

export const BRAND = {
  name: "Florenza",
  founder: "Sharayu Nigade Deshmukh",
  location: "Pune, Maharashtra",
  phone: "9130198817",
  phoneIntl: "919130198817",
  phoneDisplay: "+91 91301 98817",
  positioning: "Fresh. Premium. Naturally Grown Microgreens.",
  core: ["Young greens.", "Fresh nutrition.", "Thoughtfully grown."],
  heroLine: "Young greens, carefully grown and harvested at their most tender stage.",
  focus: "FLORENZA focuses on careful cultivation, hygienic handling, freshness and transparent information.",
  philosophy: "We don't make exaggerated health claims. We let the science speak.",
  pillars: ["Grow with science.", "Harvest with care.", "Serve fresh."],
  disclaimer:
    "Microgreens are foods, not medicines. They should not be used to diagnose, treat, cure or prevent disease. People with medical conditions should follow advice from qualified healthcare professionals.",
};

export const INTRO = {
  definition:
    "Microgreens are young edible plants harvested shortly after germination, generally when cotyledons are developed and the first true leaves may begin to emerge. They are different from sprouts because they are grown to a more developed seedling stage, usually with light and a growing medium.",
  window: "Generally harvested approximately 7–21 days after germination, although the exact window varies considerably by crop.",
  cycle: ["Seed", "Germination", "Seedling", "Microgreen", "Mature plant"],
  notJust: "Microgreens should not be described simply as “sprouts with leaves.” They are produced and harvested at a different developmental stage.",
};

export const SPROUTS_VS = [
  { k: "Development", sprouts: "Very early germination", micro: "More developed seedling" },
  { k: "Growing system", sprouts: "Often water/moisture based", micro: "Usually soil/soilless medium" },
  { k: "Light", sprouts: "Usually not required during early sprouting", micro: "Important for photosynthesis" },
  { k: "Harvest", sprouts: "Very young", micro: "Usually after cotyledons develop" },
  { k: "Edible portion", sprouts: "Seed, root and shoot may be consumed", micro: "Usually stem + cotyledons/young leaves" },
  { k: "Growing period", sprouts: "Usually a few days", micro: "Commonly ~7–21 days" },
  { k: "Food safety", sprouts: "Specific microbial concerns", micro: "Requires hygienic production and handling" },
];

/*
  CROPS
  status: "profile"   → educational crop profile (default)
          "available" → confirmed for sale; shows a "Currently growing" mark.
  The PDF does not confirm availability for any crop, so all are profiles.
  Change a crop's status to "available" once it is confirmed.

  spec keys follow the PDF tables. All values are FLORENZA starting
  specifications for a 10 × 20 inch tray, not guaranteed results.
*/
export const CROPS = [
  {
    id: "broccoli",
    name: "Broccoli",
    latin: "Brassica oleracea var. italica",
    family: "Brassicaceae",
    status: "profile",
    flavour: "Mild, fresh, slightly vegetal",
    spec: { seed: "~12–15 g", tray: "10 × 20 inch", soak: "Usually not required", germination: "~1–3 days", blackout: "~1–2 days", light: "Bright indirect/natural or suitable grow light", harvest: "~7–12 days", yield: "~120–180 g", difficulty: "Easy" },
    problems: "Excess moisture, mould, poor airflow",
    uses: ["Salads", "Sandwiches", "Wraps", "Bowls", "Garnishing"],
    nutrition: ["Vitamin C", "Vitamin K", "Carotenoids", "Folate", "Minerals", "Glucosinolates"],
    nutritionLead: "Broccoli microgreens have been studied for",
    science:
      "Brassica vegetables contain glucosinolates. Certain glucosinolates can contribute to the formation of isothiocyanates, including sulforaphane, depending on the plant and processing conditions. Broccoli microgreens are a source of plant compounds that are actively studied for their potential biological effects. Research findings should not be interpreted as evidence that broccoli microgreens treat or cure disease.",
    tone: "#1C5A3B",
    accent: "#8FC49E",
    seed: 23,
  },
  {
    id: "fenugreek",
    name: "Fenugreek",
    local: "Methi",
    latin: "Trigonella foenum-graecum",
    family: "Fabaceae",
    status: "profile",
    flavour: "Distinctive, fresh, slightly bitter",
    spec: { seed: "~20–25 g", tray: "10 × 20 inch", soak: "Optional, ~4–6 h", germination: "~1–2 days", blackout: "~1–2 days", light: "Moderate–bright", harvest: "~7–12 days", yield: "~120–200 g", difficulty: "Easy–medium" },
    problems: "Excess moisture, uneven germination",
    uses: ["Poha", "Paratha", "Thepla", "Salads", "Wraps"],
    nutrition: ["Polyphenols", "Flavonoids", "Minerals", "Protein", "Fibre", "Other phytochemicals"],
    nutritionLead: "Fenugreek seeds and young plants contain various",
    science: "Evidence about fenugreek seeds or extracts cannot automatically be transferred to fenugreek microgreens.",
    tone: "#4D4A22",
    accent: "#D2BC7A",
    seed: 37,
  },
  {
    id: "redAmaranth",
    name: "Red Amaranth",
    latin: "Amaranthus spp.",
    family: "Amaranthaceae",
    status: "profile",
    flavour: "Mild, earthy",
    spec: { seed: "~4–6 g", tray: "10 × 20 inch", soak: "No", germination: "~2–4 days", blackout: "~2–4 days", light: "Bright light", harvest: "~10–15 days", yield: "~60–130 g", difficulty: "Medium" },
    problems: "Leggy growth, excess humidity, colour loss",
    uses: ["Salads", "Raita", "Chaat", "Bowls", "Plating"],
    nutrition: ["Carotenoids", "Vitamin C", "Vitamin K", "Minerals", "Phenolic compounds", "Anthocyanins (red/purple varieties)"],
    nutritionLead: "Amaranth microgreens can contain",
    science:
      "Why is red amaranth red? The colour is associated largely with anthocyanin pigments — plant pigments responsible for red, purple and blue coloration in many plants.",
    tone: "#4A0F1C",
    accent: "#D06A7B",
    seed: 11,
  },
  {
    id: "greenAmaranth",
    name: "Green Amaranth",
    status: "profile",
    flavour: "Mild",
    specNote: "Similar production profile to red amaranth.",
    traits: ["Green coloration", "Mild flavour", "Tender leaves", "Decorative appearance"],
    nutrition: ["Carotenoids", "Vitamin C", "Vitamin K", "Minerals", "Polyphenolic compounds"],
    nutritionLead: "Potential nutritional components include",
    science: "Actual concentration varies by cultivar and growing conditions.",
    tone: "#2E5A26",
    accent: "#A9CF8E",
    seed: 17,
  },
  {
    id: "radish",
    name: "Radish",
    latin: "Raphanus sativus",
    family: "Brassicaceae",
    status: "profile",
    flavour: "Peppery",
    spec: { seed: "~15–20 g", tray: "10 × 20 inch", soak: "No", germination: "~1–2 days", blackout: "~1–2 days", light: "Bright", harvest: "~6–10 days", yield: "~120–180 g", difficulty: "Easy" },
    problems: "Overcrowding, excess moisture",
    uses: ["Salads", "Wraps", "Sandwiches", "Sushi"],
    nutrition: ["Vitamin C", "Vitamin K", "Carotenoids", "Glucosinolates", "Phenolic compounds"],
    nutritionLead: "Nutritional research includes",
    tone: "#43202A",
    accent: "#E09AA8",
    seed: 41,
  },
  {
    id: "moong",
    name: "Moong",
    latin: "Vigna radiata",
    status: "profile",
    flavour: "Mild, fresh, vegetal",
    spec: { seed: "~25–35 g", tray: "10 × 20 inch", soak: "~6–8 h, optional", germination: "~1–2 days", blackout: "~1–3 days", light: "Bright", harvest: "~7–12 days", yield: "~100–180 g", difficulty: "Easy–medium" },
    problems: "Hulls, excess moisture",
    uses: ["Poha", "Chaat", "Salads", "Wraps"],
    nutrition: ["Protein", "Minerals", "Vitamin C", "Polyphenols", "Other phytochemicals"],
    nutritionLead: "Nutritionally, legume microgreens can provide",
    tone: "#3C4A22",
    accent: "#C7D59A",
    seed: 61,
  },
  {
    id: "pea",
    name: "Pea",
    latin: "Pisum sativum",
    status: "profile",
    flavour: "Fresh, sweet",
    spec: { seed: "~80–100 g", tray: "10 × 20 inch", soak: "~8–12 h", germination: "~2–4 days", blackout: "~2–4 days", light: "Bright", harvest: "~8–14 days", yield: "~150–250 g", difficulty: "Easy" },
    problems: "Seed rot, uneven emergence",
    uses: ["Stir-fry", "Salads", "Soups", "Sandwiches"],
    tone: "#2D5A2A",
    accent: "#A7D49A",
    seed: 71,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    latin: "Helianthus annuus",
    status: "profile",
    flavour: "Nutty, crisp",
    spec: { seed: "~60–80 g", tray: "10 × 20 inch", soak: "~6–12 h", germination: "~2–4 days", blackout: "~2–4 days", light: "Bright", harvest: "~8–12 days", yield: "~150–250 g", difficulty: "Easy–medium" },
    problems: "Hull retention, mould",
    uses: ["Salads", "Wraps", "Sandwiches", "Bowls"],
    tone: "#4F4218",
    accent: "#E3C875",
    seed: 83,
  },
  {
    id: "mustard",
    name: "Mustard",
    latin: "Brassica spp.",
    status: "profile",
    flavour: "Peppery, pungent",
    spec: { seed: "~12–18 g", tray: "10 × 20 inch", soak: "No", germination: "~1–2 days", blackout: "~1–2 days", light: "Bright", harvest: "~6–10 days", yield: "~120–200 g", difficulty: "Easy" },
    problems: "Leggy growth, excess moisture",
    uses: ["Chaat", "Sandwiches", "Salads", "Indian garnishing"],
    tone: "#4A4A16",
    accent: "#D8D27A",
    seed: 97,
  },
  {
    id: "chavali",
    name: "Chavali",
    local: "Cowpea",
    latin: "Vigna unguiculata",
    status: "profile",
    flavour: "Mild, bean-like",
    spec: { seed: "~35–50 g", tray: "10 × 20 inch", soak: "~6–10 h", germination: "~2–3 days", blackout: "~2–4 days", light: "Bright", harvest: "~8–14 days", yield: "~120–220 g", difficulty: "Medium" },
    problems: "Seed rot, uneven emergence",
    uses: ["Usal", "Salads", "Wraps", "Stir-fries"],
    tone: "#3D2F24",
    accent: "#D2A98A",
    seed: 103,
  },
];

export const SPEC_ROWS = [
  ["seed", "Seed"],
  ["tray", "Tray"],
  ["soak", "Soaking"],
  ["germination", "Germination"],
  ["blackout", "Blackout"],
  ["light", "Light"],
  ["harvest", "Harvest"],
  ["yield", "Expected yield*"],
  ["difficulty", "Difficulty"],
];

export const YIELD_NOTE =
  "*Starting specifications for a 10 × 20 inch tray. Yield is a working estimate: actual results depend on seed lot, density, environment, medium and harvest stage.";

/* Growing sequence: Seed → Soak → Sow → Germinate → Blackout → Light → Grow → Harvest → Pack → Deliver.
   `specKey` pulls the crop-specific value so the interface never implies one process fits all. */
export const STAGES = [
  { id: "seed", name: "Seed", growth: 0, specKey: "seed", specLabel: "Seed per tray", line: "Select clean, viable seed." },
  { id: "soak", name: "Soak", growth: 0, specKey: "soak", specLabel: "Soaking", line: "Some seeds are soaked before sowing; others are sown dry. It depends on the crop." },
  { id: "sow", name: "Sow", growth: 0.02, specKey: "tray", specLabel: "Tray", line: "Use clean food-safe trays and an appropriate growing medium. Distribute seeds evenly." },
  { id: "germinate", name: "Germinate", growth: 0.2, specKey: "germination", specLabel: "Germination", line: "Maintain suitable moisture, oxygen and temperature." },
  { id: "blackout", name: "Blackout", growth: 0.42, specKey: "blackout", specLabel: "Blackout", line: "Use only where appropriate." },
  { id: "light", name: "Light", growth: 0.64, specKey: "light", specLabel: "Light", line: "Introduce adequate light after emergence." },
  { id: "grow", name: "Grow", growth: 0.86, specLabel: "Airflow", specFixed: "Gentle, constant", line: "Maintain gentle air circulation." },
  { id: "harvest", name: "Harvest", growth: 1, specKey: "harvest", specLabel: "Harvest", line: "Harvest at the desired crop-specific stage." },
  { id: "pack", name: "Pack", growth: 1, specLabel: "Handling", specFixed: "Minimal", line: "Handle hygienically and package promptly." },
  { id: "deliver", name: "Deliver", growth: 1, specLabel: "Best", specFixed: "Enjoyed fresh", line: "Best enjoyed fresh. Storage life depends on crop, packaging and temperature." },
];

export const NUTRIENTS = {
  Vitamins: {
    note: "In varying amounts, depending on species.",
    items: [
      { name: "Vitamin C", crops: ["broccoli", "redAmaranth", "greenAmaranth", "radish", "moong"] },
      { name: "Vitamin E", crops: [] },
      { name: "Vitamin K", crops: ["broccoli", "redAmaranth", "greenAmaranth", "radish"] },
      { name: "Provitamin A carotenoids", crops: [] },
      { name: "Folate", crops: ["broccoli"] },
      { name: "Other B vitamins", crops: [] },
    ],
  },
  Minerals: {
    note: "Crop profiles note minerals generally. Specific amounts vary by crop and growing conditions.",
    items: [
      { name: "Calcium", crops: [] },
      { name: "Potassium", crops: [] },
      { name: "Magnesium", crops: [] },
      { name: "Iron", crops: [] },
      { name: "Zinc", crops: [] },
      { name: "Phosphorus", crops: [] },
      { name: "Manganese", crops: [] },
    ],
    generalCrops: ["broccoli", "fenugreek", "redAmaranth", "greenAmaranth", "moong"],
  },
  "Plant compounds": {
    note: "Different crops contain different bioactive compounds.",
    items: [
      { name: "Carotenoids", crops: ["broccoli", "redAmaranth", "greenAmaranth", "radish"] },
      { name: "Polyphenols", crops: ["fenugreek", "greenAmaranth", "moong"] },
      { name: "Flavonoids", crops: ["fenugreek"] },
      { name: "Phenolic acids", crops: [] },
      { name: "Glucosinolates", crops: ["broccoli", "radish"] },
      { name: "Anthocyanins", crops: ["redAmaranth"] },
    ],
  },
};

export const NUTRITION_FACTORS = ["Plant species", "Cultivar", "Seed quality", "Growing medium", "Light", "Temperature", "Humidity", "Harvest stage", "Growing conditions"];

export const HEALTH = [
  { area: "Heart / cardiovascular health", relevance: "Potassium, magnesium, fibre and phytochemicals are relevant to an overall healthy dietary pattern.", wording: "Can contribute nutrients to a balanced diet." },
  { area: "Diabetes management", relevance: "Low-calorie vegetables and fibre-containing foods can be part of healthy dietary patterns.", wording: "Can be incorporated into balanced meals." },
  { area: "Bone health", relevance: "Vitamin K, calcium and magnesium are relevant nutrients.", wording: "Provides nutrients involved in normal bone physiology." },
  { area: "Immune function", relevance: "Vitamin C, vitamin A-related compounds and zinc have physiological roles.", wording: "Contains nutrients involved in normal immune function." },
  { area: "Eye health", relevance: "Carotenoids such as lutein and beta-carotene are relevant.", wording: "Some varieties provide carotenoids associated with normal visual physiology." },
  { area: "Anaemia", relevance: "Iron and folate are involved in blood formation, but nutrient content and bioavailability vary.", wording: "Some varieties contain iron or folate. They should not be presented as a treatment for anaemia." },
  { area: "Oxidative stress", relevance: "Polyphenols and carotenoids have antioxidant activity in experimental research.", wording: "Contains plant compounds with antioxidant activity." },
];

export const RESEARCH_NOTE =
  "Broccoli and other Brassica microgreens contain glucosinolates, including compounds that can contribute to sulforaphane formation. These compounds are being extensively studied for their biological activities. However, consuming microgreens should not be presented as a treatment or cure for cancer or any other disease.";

export const SOURCES = [
  "Penn State Extension — microgreen production, seeding, watering and harvesting",
  "U.S. FDA — produce and sprout food-safety guidance",
  "Peer-reviewed literature on microgreen nutritional composition",
  "Peer-reviewed studies on Brassica glucosinolates and sulforaphane",
  "Research on carotenoids, phenolics, vitamins and minerals in different microgreen species",
];

export const GUIDE = {
  space: {
    pillars: ["Cleanliness", "Light", "Airflow", "Water control", "Organization"],
    avoid: ["Standing water", "Excess humidity", "Poor ventilation", "Overcrowding", "Dirty trays", "Uncontrolled pests", "Excessive heat"],
  },
  care: {
    morning: ["Check moisture", "Inspect roots/stems", "Check mould/unusual growth", "Check colour", "Check airflow", "Check light"],
    evening: ["Inspect crop", "Remove unsuitable material", "Clean tools", "Record observations", "Prepare next batch"],
  },
  harvest: {
    signs: ["Healthy colour", "Upright growth", "Developed cotyledons", "Appropriate size", "Good texture", "Desired flavour", "No visible mould or deterioration"],
    rule: "Harvest according to crop condition — not only according to the calendar.",
  },
  post: {
    sequence: ["Harvest", "Inspect", "Sort", "Weigh", "Pack", "Store", "Deliver"],
    important: ["Minimize handling", "Use clean equipment", "Avoid excessive free water", "Remove damaged material", "Maintain appropriate temperature", "Maintain traceability"],
    storageFactors: ["Temperature", "Relative humidity", "Condensation", "Packaging", "Harvest maturity", "Mechanical damage", "Microbial contamination"],
    storage: "Best enjoyed fresh. Storage life depends on crop, packaging and temperature. FLORENZA validates storage recommendations through product-specific trials.",
    records: ["Batch number", "Crop", "Variety", "Seed supplier", "Seed lot", "Seed quantity", "Tray size", "Medium", "Sowing date", "Germination date", "Blackout duration", "Light started", "Harvest date", "Harvest weight", "Reject weight", "Saleable yield", "Packaging quantity", "Customer feedback"],
  },
  trouble: [
    { problem: "Poor germination", reason: "Seed quality / moisture / temperature" },
    { problem: "Uneven growth", reason: "Uneven sowing / watering" },
    { problem: "Leggy plants", reason: "Insufficient light" },
    { problem: "Yellow seedlings", reason: "Light / environmental stress" },
    { problem: "Mould", reason: "Excess moisture + poor airflow + hygiene issue" },
    { problem: "Seed rot", reason: "Excess moisture / poor drainage" },
    { problem: "Poor colour", reason: "Light / cultivar / harvest stage" },
    { problem: "Low yield", reason: "Density / seed quality / stress / harvest timing" },
  ],
  method: ["Observe", "Identify", "Adjust", "Record"],
};

/* `crops` = microgreens the founder names for the dish. Empty = "fresh microgreens" (unspecified). */
export const RECIPES = [
  { id: "poha", cuisine: "Indian", name: "Microgreen Poha", parts: ["Poha", "Onion", "Peas", "Lemon", "Coriander", "Fresh microgreens"], crops: [] },
  { id: "chaat", cuisine: "Indian", name: "Microgreen Chaat", parts: ["Chana", "Potato", "Tomato", "Onion", "Lemon", "Chaat masala", "Radish/amaranth microgreens"], crops: ["radish", "redAmaranth"] },
  { id: "thepla", cuisine: "Indian", name: "Microgreen Thepla", parts: ["Methi microgreens", "Wheat flour", "Spices", "Yogurt"], crops: ["fenugreek"] },
  { id: "paneer", cuisine: "Indian", name: "Microgreen Paneer Roll", parts: ["Roti", "Paneer", "Vegetables", "Chutney", "Fresh microgreens"], crops: [] },
  { id: "misal", cuisine: "Indian", name: "Microgreen Misal Garnish", parts: ["Misal", "Fresh microgreens as a finishing element"], crops: [] },
  { id: "toast", cuisine: "International", name: "Avocado Microgreen Toast", parts: ["Avocado", "Lemon", "Pepper", "Sunflower/pea microgreens"], crops: ["sunflower", "pea"] },
  { id: "sushi", cuisine: "International", name: "Microgreen Sushi", parts: ["Nori", "Sushi rice", "Avocado", "Cucumber", "Radish microgreens"], crops: ["radish"] },
  { id: "bowl", cuisine: "International", name: "Buddha Bowl", parts: ["Quinoa/rice", "Chickpeas", "Vegetables", "Dressing", "Microgreens"], crops: [] },
  { id: "pasta", cuisine: "International", name: "Microgreen Pasta", parts: ["Pasta", "Garlic", "Olive oil", "Vegetables", "Broccoli microgreens"], crops: ["broccoli"] },
  { id: "pizza", cuisine: "International", name: "Microgreen Pizza", parts: ["Fresh microgreens, added after baking"], crops: [] },
];

/* Dish keywords → crops whose profile lists that dish under "Uses". Derived from CROPS. */
export function cropsListingDish(recipe) {
  const key = { poha: "Poha", chaat: "Chaat", thepla: "Thepla", sushi: "Sushi" }[recipe.id];
  if (!key) return [];
  return CROPS.filter((c) => (c.uses || []).includes(key) && !recipe.crops.includes(c.id)).map((c) => c.id);
}
