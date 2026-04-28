// Service to fetch exercise data from the free ExerciseDB API
// With fallback to local exercise GIF database
// API: https://v2.exercisedb.io

const EXERCISEDB_API_BASE = 'https://v2.exercisedb.io/exercises';
const { getExerciseFromDatabase } = require('./exerciseGifDatabase');

// Mapping of our exercise names to ExerciseDB search terms
const EXERCISE_MAPPINGS = {
  'Mountain Climber': 'mountain climber',
  'Russian Twist': 'russian twist',
  'Bench Press': 'barbell bench press',
  'Barbell Bench Press': 'barbell bench press',
  'Push Up': 'push-up',
  'Push-Up': 'push-up',
  'Pull Up': 'pull-up',
  'Pull-Up': 'pull-up',
  'Squat': 'barbell squat',
  'Barbell Squat': 'barbell squat',
  'Deadlift': 'deadlift',
  'Plank': 'plank',
  'Lunges': 'lunge',
  'Lunge': 'lunge',
  'Hip Thrust': 'barbell hip thrust',
  'Barbell Hip Thrust': 'barbell hip thrust',
  'Lat Pulldown': 'cable lat pulldown',
  'Cable Lat Pulldown': 'cable lat pulldown',
  'Bicep Curl': 'dumbbell bicep curl',
  'Dumbbell Bicep Curl': 'dumbbell bicep curl',
  'Tricep Pushdown': 'cable triceps pushdown',
  'Cable Triceps Pushdown': 'cable triceps pushdown',
  'Lateral Raise': 'dumbbell lateral raise',
  'Dumbbell Lateral Raise': 'dumbbell lateral raise',
  'Overhead Press': 'barbell overhead press',
  'Barbell Overhead Press': 'barbell overhead press',
  'Romanian Deadlift': 'romanian deadlift',
  'Leg Press': 'leg press',
  'Calf Raise': 'standing calf raise',
  'Standing Calf Raise': 'standing calf raise',
  'Burpees': 'burpee',
  'Burpee': 'burpee',
  'Box Jump': 'box jump',
  'Dumbbell Row': 'dumbbell bent over row',
  'Barbell Row': 'barbell bent over row',
  'Chest Fly': 'dumbbell chest fly',
  'Dumbbell Chest Fly': 'dumbbell chest fly',
  'Leg Curl': 'leg curl',
  'Leg Extension': 'leg extension',
  'Abdominal Crunch': 'abdominal crunch',
  'Crunch': 'abdominal crunch',
  'Dumbbell Shoulder Press': 'dumbbell shoulder press',
  'Shoulder Press': 'dumbbell shoulder press',
  'Barbell Curls': 'barbell curl',
  'Barbell Curl': 'barbell curl',
  'Incline Bench Press': 'incline barbell bench press',
  'Decline Bench Press': 'decline barbell bench press',
  'Machine Leg Press': 'leg press',
  'Smith Machine Squat': 'barbell squat',
  'Goblet Squat': 'goblet squat',
  'Dumbbell Squat': 'dumbbell squat',
  'Kettlebell Swing': 'kettlebell swing',
};

async function searchExerciseDb(name) {
  try {
    // Try local database first (faster and always available)
    const dbExercise = getExerciseFromDatabase(name);
    if (dbExercise) {
      return {
        name: name,
        gifUrl: dbExercise.gifUrl,
        instructions: dbExercise.instructions,
        targetMuscles: dbExercise.targetMuscles,
        secondaryMuscles: dbExercise.secondaryMuscles,
        equipment: dbExercise.equipment
      };
    }

    // Fallback to ExerciseDB API if available (commented out due to auth requirement)
    // const searchTerm = EXERCISE_MAPPINGS[name] || name.toLowerCase();
    // const url = `${EXERCISEDB_API_BASE}/name/${encodeURIComponent(searchTerm)}?limit=1`;
    //
    // const response = await fetch(url);
    // if (!response.ok) {
    //   console.warn(`ExerciseDB API error for "${name}": ${response.status}`);
    //   return null;
    // }
    // ...

    // If not found in local database and API is unavailable
    console.warn(`Exercise "${name}" not found in local database`);
    return null;
  } catch (err) {
    console.error(`Error fetching exercise data for "${name}":`, err);
    return null;
  }
}

module.exports = {
  searchExerciseDb,
  EXERCISE_MAPPINGS
};
