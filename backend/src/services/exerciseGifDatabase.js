// Fallback exercise GIF database for common exercises
// These are GIF URLs from various free exercise databases and resources
// When ExerciseDB API is unavailable, this provides exercise data

const EXERCISE_GIF_DATABASE = {
  'mountain climber': {
    gifUrl: 'https://media.giphy.com/media/Yki1H2lYTt8J2tT2Px/giphy.gif',
    targetMuscles: ['Chest', 'Core'],
    secondaryMuscles: ['Shoulders', 'Legs'],
    equipment: 'bodyweight',
    instructions: [
      'Start in a high plank position with hands under shoulders',
      'Keep your core tight and body in a straight line',
      'Bring one knee towards your chest quickly',
      'Return to start position and switch legs',
      'Move at a controlled, steady pace'
    ]
  },
  'russian twist': {
    gifUrl: 'https://media.giphy.com/media/9hzJN6N1s1iGVjn8sD/giphy.gif',
    targetMuscles: ['Obliques'],
    secondaryMuscles: ['Core', 'Abs'],
    equipment: 'bodyweight',
    instructions: [
      'Sit on the floor with knees bent and feet together',
      'Lean back slightly to engage your core',
      'Hold your hands together or interlaced at chest height',
      'Rotate your torso to the right, bring hands towards the floor',
      'Return to center and rotate to the left'
    ]
  },
  'push-up': {
    gifUrl: 'https://media.giphy.com/media/5h0LOB7pz2MGBKVHHE/giphy.gif',
    targetMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'bodyweight',
    instructions: [
      'Start in a high plank position with hands shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your body by bending your elbows',
      'Go down until your chest nearly touches the floor',
      'Push yourself back to the starting position'
    ]
  },
  'plank': {
    gifUrl: 'https://media.giphy.com/media/uAq8e7e6N9JI4ZbPVs/giphy.gif',
    targetMuscles: ['Core'],
    secondaryMuscles: ['Shoulders', 'Chest', 'Abs'],
    equipment: 'bodyweight',
    instructions: [
      'Get into a push-up position but rest on your forearms',
      'Keep your body in a straight line from head to heels',
      'Engage your core and glutes',
      'Hold this position without letting your hips sag',
      'Breathe steadily throughout the hold'
    ]
  },
  'squat': {
    gifUrl: 'https://media.giphy.com/media/9t6xpYZ9npJmM/giphy.gif',
    targetMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'bodyweight',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep your chest up and core engaged',
      'Lower your body by bending your knees and hips',
      'Descend until your thighs are parallel to the ground',
      'Drive through your heels to return to starting position'
    ]
  },
  'burpee': {
    gifUrl: 'https://media.giphy.com/media/vRJ3lP16jQT8l0RM8Y/giphy.gif',
    targetMuscles: ['Full Body'],
    secondaryMuscles: ['Core', 'Cardio'],
    equipment: 'bodyweight',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Crouch down and place hands on the floor',
      'Jump or step your feet back into a plank position',
      'Perform a push-up',
      'Jump your feet back towards your hands',
      'Stand up and jump with arms overhead'
    ]
  },
  'lunge': {
    gifUrl: 'https://media.giphy.com/media/l3vR85PUkt9DccolZa/giphy.gif',
    targetMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    equipment: 'bodyweight',
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg about 2-3 feet',
      'Lower your hips until both knees are bent at 90 degrees',
      'Push through your front heel to return to starting position',
      'Repeat on the other side'
    ]
  },
  'pull-up': {
    gifUrl: 'https://media.giphy.com/media/8c1C0xNJQ7tNm/giphy.gif',
    targetMuscles: ['Back', 'Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'pull-up bar',
    instructions: [
      'Grip the bar with hands slightly wider than shoulder-width',
      'Hang with arms fully extended',
      'Pull yourself up by driving your elbows down',
      'Bring your chin above the bar',
      'Slowly lower yourself back to the starting position'
    ]
  },
  'deadlift': {
    gifUrl: 'https://media.giphy.com/media/8Ew6RqMfQ4XhO/giphy.gif',
    targetMuscles: ['Back', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Quadriceps', 'Core'],
    equipment: 'barbell',
    instructions: [
      'Stand with feet hip-width apart with barbell over midfoot',
      'Bend at the hips and knees to grip the bar',
      'Keep your back straight and chest up',
      'Drive through your heels to lift the bar',
      'Stand tall at the top, then lower back down with control'
    ]
  },
  'bench press': {
    gifUrl: 'https://media.giphy.com/media/l0Iy2Z8dHECWlj4WGQ/giphy.gif',
    targetMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'barbell',
    instructions: [
      'Lie flat on a bench with feet on the floor',
      'Grip the bar slightly wider than shoulder-width',
      'Lower the bar to your chest with control',
      'Press the bar back up to the starting position',
      'Keep your core tight and avoid excessive arching'
    ]
  }
};

// Get exercise data from fallback database
function getExerciseFromDatabase(name) {
  const lowercaseName = name.toLowerCase();

  // Direct match
  if (EXERCISE_GIF_DATABASE[lowercaseName]) {
    return EXERCISE_GIF_DATABASE[lowercaseName];
  }

  // Fuzzy match - check if the name contains or is contained in database keys
  for (const [key, data] of Object.entries(EXERCISE_GIF_DATABASE)) {
    if (lowercaseName.includes(key) || key.includes(lowercaseName)) {
      return data;
    }
  }

  return null;
}

module.exports = {
  getExerciseFromDatabase,
  EXERCISE_GIF_DATABASE
};
