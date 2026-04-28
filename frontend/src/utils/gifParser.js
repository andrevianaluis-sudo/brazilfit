// Parse Gymvisual GIF filenames to extract exercise name and muscle group
export function parseGifFilename(filename) {
  // Example: 02571301-Circles-Knee-Stretch_Calves_180.gif
  // Remove the extension
  const nameWithoutExt = filename.replace('_180.gif', '');

  // Split by underscore to separate name from muscle group
  const parts = nameWithoutExt.split('_');
  const muscleGroupRaw = parts[parts.length - 1]; // Last part is muscle group
  const nameRaw = parts.slice(0, -1).join('_'); // Everything before muscle group

  // Remove ID prefix (e.g., "02571301-" or "06431301-")
  const cleanName = nameRaw.replace(/^\d+-/, '');

  // Remove parenthetical notes like "(side-POV)" or "(male)"
  const nameWithoutNotes = cleanName
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-\s*/g, ' ') // Convert hyphens to spaces
    .trim();

  // Map raw muscle groups to canonical categories
  const muscleGroupMap = {
    'Neck': 'Neck',
    'Neck-FIX': 'Neck',
    'Shoulders': 'Shoulders',
    'Shoulders FIX': 'Shoulders',
    'Shoulder': 'Shoulders',
    'Back': 'Back',
    'Back FIX': 'Back',
    'Upper-Arms': 'Arms',
    'Upper Arms': 'Arms',
    'Forearms': 'Arms',
    'Hands': 'Arms',
    'Chest': 'Chest',
    'Chest FIX': 'Chest',
    'Hips': 'Hips',
    'Hips FIX': 'Hips',
    'Thighs': 'Legs',
    'Calves': 'Calves',
    'Calf': 'Calves',
    'Feet': 'Calves',
    'Waist': 'Core',
    'Stretching': 'Full Body',
    'Stretching FIX': 'Full Body',
    'Articulations': 'Full Body',
    'Yoga': 'Full Body',
    'Pilates': 'Full Body',
    'Isometric': 'Full Body'
  };

  const category = muscleGroupMap[muscleGroupRaw] || 'Full Body';

  return {
    filename,
    name: nameWithoutNotes,
    category,
    rawMuscleGroup: muscleGroupRaw
  };
}

// Get all unique muscle groups from exercises
export function getUniqueMuscleGroups(exercises) {
  const groups = new Set(exercises.map(ex => ex.category));
  return ['All', ...Array.from(groups).sort()];
}
