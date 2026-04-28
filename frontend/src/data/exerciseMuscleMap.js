// Maps each exercise to its primary and secondary muscles
// Used to highlight muscles in the MuscleDiagram component

export const EXERCISE_MUSCLE_MAP = {
  // Core & Cardio
  'Mountain Climber': {
    primary: ['abs', 'hip_flexors', 'quads'],
    secondary: ['chest', 'front_shoulders', 'triceps'],
    preferredView: 'front'
  },
  'Russian Twist': {
    primary: ['obliques', 'abs'],
    secondary: ['hip_flexors'],
    preferredView: 'front'
  },
  'Plank': {
    primary: ['abs', 'obliques'],
    secondary: ['chest', 'front_shoulders', 'quads', 'glutes'],
    preferredView: 'front'
  },
  'Crunches': {
    primary: ['abs'],
    secondary: ['obliques', 'hip_flexors'],
    preferredView: 'front'
  },
  'Leg Raise': {
    primary: ['abs', 'hip_flexors'],
    secondary: ['obliques'],
    preferredView: 'front'
  },
  'Ab Wheel Rollout': {
    primary: ['abs', 'obliques'],
    secondary: ['lats', 'front_shoulders'],
    preferredView: 'front'
  },
  'Dead Bug': {
    primary: ['abs', 'hip_flexors'],
    secondary: ['obliques'],
    preferredView: 'front'
  },
  'Burpees': {
    primary: ['chest', 'quads', 'abs'],
    secondary: ['front_shoulders', 'triceps', 'glutes'],
    preferredView: 'front'
  },
  'Box Jump': {
    primary: ['quads', 'glutes', 'calves'],
    secondary: ['hamstrings', 'abs'],
    preferredView: 'front'
  },
  'Treadmill Run': {
    primary: ['quads', 'hamstrings', 'calves'],
    secondary: ['glutes', 'hip_flexors'],
    preferredView: 'front'
  },
  'Rowing Machine': {
    primary: ['lats', 'back_shoulders'],
    secondary: ['biceps', 'quads', 'abs'],
    preferredView: 'back'
  },
  'Jump Rope': {
    primary: ['calves', 'quads'],
    secondary: ['front_shoulders', 'abs'],
    preferredView: 'front'
  },

  // Chest & Upper Body
  'Bench Press': {
    primary: ['chest', 'front_shoulders'],
    secondary: ['triceps'],
    preferredView: 'front'
  },
  'Barbell Bench Press': {
    primary: ['chest', 'front_shoulders'],
    secondary: ['triceps'],
    preferredView: 'front'
  },
  'Incline Bench Press': {
    primary: ['chest', 'front_shoulders'],
    secondary: ['triceps'],
    preferredView: 'front'
  },
  'Decline Bench Press': {
    primary: ['chest'],
    secondary: ['front_shoulders', 'triceps'],
    preferredView: 'front'
  },
  'Push Up': {
    primary: ['chest', 'front_shoulders', 'triceps'],
    secondary: ['abs'],
    preferredView: 'front'
  },
  'Push-Up': {
    primary: ['chest', 'front_shoulders', 'triceps'],
    secondary: ['abs'],
    preferredView: 'front'
  },
  'Chest Fly': {
    primary: ['chest'],
    secondary: ['front_shoulders'],
    preferredView: 'front'
  },
  'Dumbbell Chest Fly': {
    primary: ['chest'],
    secondary: ['front_shoulders'],
    preferredView: 'front'
  },

  // Back & Pulling
  'Pull Up': {
    primary: ['lats', 'biceps'],
    secondary: ['traps', 'back_shoulders'],
    preferredView: 'back'
  },
  'Pull-Up': {
    primary: ['lats', 'biceps'],
    secondary: ['traps', 'back_shoulders'],
    preferredView: 'back'
  },
  'Lat Pulldown': {
    primary: ['lats', 'biceps'],
    secondary: ['back_shoulders', 'traps'],
    preferredView: 'back'
  },
  'Cable Lat Pulldown': {
    primary: ['lats', 'biceps'],
    secondary: ['back_shoulders', 'traps'],
    preferredView: 'back'
  },
  'Bent Over Row': {
    primary: ['lats', 'back_shoulders'],
    secondary: ['biceps', 'lower_back', 'traps'],
    preferredView: 'back'
  },
  'Dumbbell Row': {
    primary: ['lats', 'back_shoulders'],
    secondary: ['biceps', 'lower_back', 'traps'],
    preferredView: 'back'
  },
  'Barbell Row': {
    primary: ['lats', 'back_shoulders'],
    secondary: ['biceps', 'lower_back', 'traps'],
    preferredView: 'back'
  },
  'Seated Cable Row': {
    primary: ['lats', 'traps'],
    secondary: ['biceps', 'back_shoulders'],
    preferredView: 'back'
  },
  'Face Pull': {
    primary: ['back_shoulders', 'traps'],
    secondary: ['biceps'],
    preferredView: 'back'
  },

  // Shoulders
  'Shoulder Press': {
    primary: ['front_shoulders', 'triceps'],
    secondary: ['traps', 'abs'],
    preferredView: 'front'
  },
  'Dumbbell Shoulder Press': {
    primary: ['front_shoulders', 'triceps'],
    secondary: ['traps', 'abs'],
    preferredView: 'front'
  },
  'Barbell Shoulder Press': {
    primary: ['front_shoulders', 'triceps'],
    secondary: ['traps', 'abs'],
    preferredView: 'front'
  },
  'Overhead Press': {
    primary: ['front_shoulders', 'triceps'],
    secondary: ['traps', 'abs'],
    preferredView: 'front'
  },
  'Barbell Overhead Press': {
    primary: ['front_shoulders', 'triceps'],
    secondary: ['traps', 'abs'],
    preferredView: 'front'
  },
  'Lateral Raise': {
    primary: ['front_shoulders', 'back_shoulders'],
    secondary: ['traps'],
    preferredView: 'front'
  },
  'Dumbbell Lateral Raise': {
    primary: ['front_shoulders', 'back_shoulders'],
    secondary: ['traps'],
    preferredView: 'front'
  },
  'Arnold Press': {
    primary: ['front_shoulders', 'back_shoulders'],
    secondary: ['triceps', 'traps'],
    preferredView: 'front'
  },

  // Arms
  'Bicep Curl': {
    primary: ['biceps'],
    secondary: ['forearms'],
    preferredView: 'front'
  },
  'Dumbbell Bicep Curl': {
    primary: ['biceps'],
    secondary: ['forearms'],
    preferredView: 'front'
  },
  'Barbell Curl': {
    primary: ['biceps'],
    secondary: ['forearms'],
    preferredView: 'front'
  },
  'Barbell Curls': {
    primary: ['biceps'],
    secondary: ['forearms'],
    preferredView: 'front'
  },
  'Hammer Curl': {
    primary: ['biceps', 'forearms'],
    secondary: [],
    preferredView: 'front'
  },
  'Tricep Pushdown': {
    primary: ['triceps'],
    secondary: ['forearms'],
    preferredView: 'back'
  },
  'Cable Triceps Pushdown': {
    primary: ['triceps'],
    secondary: ['forearms'],
    preferredView: 'back'
  },
  'Skull Crusher': {
    primary: ['triceps'],
    secondary: ['forearms'],
    preferredView: 'back'
  },

  // Legs
  'Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'lower_back', 'abs'],
    preferredView: 'front'
  },
  'Barbell Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'lower_back', 'abs'],
    preferredView: 'front'
  },
  'Goblet Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'abs'],
    preferredView: 'front'
  },
  'Dumbbell Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'abs'],
    preferredView: 'front'
  },
  'Smith Machine Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'abs'],
    preferredView: 'front'
  },
  'Sumo Squat': {
    primary: ['quads', 'glutes', 'hip_flexors'],
    secondary: ['hamstrings'],
    preferredView: 'front'
  },
  'Bulgarian Split Squat': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'calves'],
    preferredView: 'front'
  },
  'Leg Press': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings'],
    preferredView: 'front'
  },
  'Machine Leg Press': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings'],
    preferredView: 'front'
  },
  'Leg Curl': {
    primary: ['hamstrings'],
    secondary: ['calves', 'glutes'],
    preferredView: 'back'
  },
  'Leg Extension': {
    primary: ['quads'],
    secondary: [],
    preferredView: 'front'
  },
  'Lunges': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'calves'],
    preferredView: 'front'
  },
  'Lunge': {
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'calves'],
    preferredView: 'front'
  },
  'Calf Raise': {
    primary: ['calves'],
    secondary: ['hamstrings'],
    preferredView: 'front'
  },
  'Standing Calf Raise': {
    primary: ['calves'],
    secondary: ['hamstrings'],
    preferredView: 'front'
  },

  // Deadlifts & Hip
  'Deadlift': {
    primary: ['lower_back', 'glutes', 'hamstrings'],
    secondary: ['traps', 'lats', 'quads'],
    preferredView: 'back'
  },
  'Romanian Deadlift': {
    primary: ['hamstrings', 'glutes'],
    secondary: ['lower_back', 'calves'],
    preferredView: 'back'
  },
  'Hip Thrust': {
    primary: ['glutes'],
    secondary: ['hamstrings', 'lower_back'],
    preferredView: 'front'
  },
  'Barbell Hip Thrust': {
    primary: ['glutes'],
    secondary: ['hamstrings', 'lower_back'],
    preferredView: 'front'
  },
  'Glute Bridge': {
    primary: ['glutes'],
    secondary: ['hamstrings', 'lower_back'],
    preferredView: 'front'
  },
  'Cable Kickback': {
    primary: ['glutes'],
    secondary: ['hamstrings'],
    preferredView: 'back'
  },
  'Donkey Kick': {
    primary: ['glutes'],
    secondary: ['lower_back', 'hamstrings'],
    preferredView: 'back'
  },
  'Kettlebell Swing': {
    primary: ['glutes', 'hamstrings'],
    secondary: ['lower_back', 'traps'],
    preferredView: 'back'
  }
};

// Helper function to get muscle map for an exercise
export function getExerciseMuscles(exerciseName) {
  return EXERCISE_MUSCLE_MAP[exerciseName] || {
    primary: [],
    secondary: [],
    preferredView: 'front'
  };
}

// Helper function to determine best view based on muscles
export function determineBestView(primaryMuscles) {
  const backMuscles = ['lats', 'traps', 'back_shoulders', 'lower_back', 'hamstrings', 'glutes'];
  const backCount = primaryMuscles.filter(m => backMuscles.includes(m)).length;

  if (backCount > primaryMuscles.length / 2) {
    return 'back';
  }
  return 'front';
}
