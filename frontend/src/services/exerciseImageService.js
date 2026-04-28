// Service to fetch exercise images and muscle data from wger API
// wger is a free, open-source exercise database

const WGER_API_BASE = 'https://wger.de/api/v2';
const CACHE_KEY = 'brazilfit_exercise_images';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Exercise name mappings to wger exercise names for better matching
const EXERCISE_MAPPINGS = {
  'Mountain Climber': 'Mountain climber',
  'Russian Twist': 'Russian twist',
  'Barbell Bench Press': 'Barbell bench press',
  'Squat': 'Barbell squat',
  'Pull-up': 'Pull-ups',
  'Plank': 'Plank',
  'Dumbbell': 'Dumbbell',
  'Push-up': 'Push-ups',
  'Deadlift': 'Deadlift',
  'Bicep Curl': 'Barbell curl',
  'Tricep Dip': 'Triceps dip',
  'Leg Press': 'Leg press',
  'Leg Curl': 'Leg curl',
  'Lat Pulldown': 'Latissimus dorsi pull down',
  'Rowing': 'Barbell bent over row',
  'Shoulder Press': 'Dumbbell shoulder press',
  'Lateral Raise': 'Dumbbell lateral raise',
  'Lunges': 'Dumbbell lunges',
  'Calf Raise': 'Calf raise',
  'Abs Crunch': 'Abdominal crunch',
};

// Primary and secondary muscle mapping from wger
const MUSCLE_COLORS = {
  primary: '#FF4444', // Red-orange for primary
  secondary: '#E8E8E8', // Light grey for secondary
};

function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const data = JSON.parse(cached);
    // Check if cache is still valid
    if (data.timestamp && Date.now() - data.timestamp < CACHE_DURATION) {
      return data.exercises || {};
    }
  } catch (err) {
    console.error('Error reading exercise cache:', err);
  }
  return {};
}

function saveCache(exercises) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      exercises,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Error saving exercise cache:', err);
  }
}

async function fetchExerciseFromWger(exerciseName) {
  try {
    // Map our exercise name to wger name for better matching
    const searchName = EXERCISE_MAPPINGS[exerciseName] || exerciseName;

    // Search for the exercise in wger
    const searchRes = await fetch(`${WGER_API_BASE}/exercise/?format=json&search=${encodeURIComponent(searchName)}&language=2`);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) return null;

    const exercise = searchData.results[0];

    // Get detailed exercise data including images
    const detailRes = await fetch(`${WGER_API_BASE}/exercise/${exercise.id}/?format=json`);
    if (!detailRes.ok) return null;

    const detailData = await detailRes.json();

    // Get primary muscles
    const primaryMuscles = detailData.muscles || [];
    const secondaryMuscles = detailData.muscles_secondary || [];

    // Get exercise images
    const images = detailData.images || [];
    const imageUrl = images.length > 0 ? images[0].image : null;

    return {
      name: exerciseName,
      imageUrl: imageUrl,
      primaryMuscles: primaryMuscles.map(m => m.name || m),
      secondaryMuscles: secondaryMuscles.map(m => m.name || m),
      cached: false
    };
  } catch (err) {
    console.error(`Error fetching exercise data for ${exerciseName}:`, err);
    return null;
  }
}

// Fallback function to generate a gradient color based on exercise name
function generateFallbackGradient(exerciseName) {
  const hash = exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `linear-gradient(135deg, hsl(${hue}, 70%, 40%), hsl(${hue + 30}, 70%, 60%))`;
}

export async function getExerciseImage(exerciseName) {
  // Check cache first
  const cache = getCache();
  if (cache[exerciseName]) {
    return {
      ...cache[exerciseName],
      cached: true
    };
  }

  // Fetch from API
  const data = await fetchExerciseFromWger(exerciseName);

  if (data) {
    // Update cache
    const cache = getCache();
    cache[exerciseName] = {
      imageUrl: data.imageUrl,
      primaryMuscles: data.primaryMuscles,
      secondaryMuscles: data.secondaryMuscles
    };
    saveCache(cache);
    return data;
  }

  // Return fallback data
  return {
    name: exerciseName,
    imageUrl: null,
    primaryMuscles: [],
    secondaryMuscles: [],
    fallbackGradient: generateFallbackGradient(exerciseName),
    cached: false
  };
}

export async function getMultipleExerciseImages(exerciseNames) {
  return Promise.all(exerciseNames.map(name => getExerciseImage(name)));
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error('Error clearing cache:', err);
  }
}
