// Service to fetch animated GIFs and exercise data from ExerciseDB
// Uses the backend proxy endpoint to avoid CORS issues

import api from '../utils/api';

const CACHE_KEY = 'brazilfit_exercisedb_cache';
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days

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
    console.error('Error reading ExerciseDB cache:', err);
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
    console.error('Error saving ExerciseDB cache:', err);
  }
}

export async function getExerciseGif(exerciseName) {
  // Check cache first
  const cache = getCache();
  if (cache[exerciseName]) {
    return {
      ...cache[exerciseName],
      cached: true
    };
  }

  try {
    // Call our backend proxy endpoint
    const res = await api.get('/exercises/search/exercisedb', {
      params: { name: exerciseName }
    });

    const data = {
      name: exerciseName,
      gifUrl: res.data.gifUrl || null,
      instructions: res.data.instructions || [],
      targetMuscles: res.data.targetMuscles || [],
      secondaryMuscles: res.data.secondaryMuscles || [],
      equipment: res.data.equipment || 'bodyweight'
    };

    // Update cache
    const updatedCache = getCache();
    updatedCache[exerciseName] = data;
    saveCache(updatedCache);

    return {
      ...data,
      cached: false
    };
  } catch (err) {
    console.error(`Failed to fetch exercise data for ${exerciseName}:`, err);
    // Return placeholder data on error
    return {
      name: exerciseName,
      gifUrl: null,
      instructions: [],
      targetMuscles: [],
      secondaryMuscles: [],
      equipment: 'bodyweight',
      error: true
    };
  }
}

export async function getMultipleExerciseGifs(exerciseNames) {
  return Promise.all(exerciseNames.map(name => getExerciseGif(name)));
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error('Error clearing ExerciseDB cache:', err);
  }
}

export function prefetchExercises(exerciseNames) {
  // Prefetch exercises in the background after a small delay
  // to avoid blocking the main thread
  setTimeout(() => {
    exerciseNames.forEach(name => {
      const cache = getCache();
      if (!cache[name]) {
        getExerciseGif(name).catch(err => {
          console.warn(`Prefetch failed for ${name}:`, err);
        });
      }
    });
  }, 1000);
}
