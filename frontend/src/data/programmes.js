// BrazilFit Programmes - Define all available programmes with stages and sessions

export const PROGRAMMES = [
  {
    id: 1,
    title: 'Pilates Foundation',
    description: 'Build your Pilates foundation with this progressive programme designed to strengthen your core and improve flexibility',
    duration: 4,
    durationUnit: 'weeks',
    frequency: '2 to 3 sessions per week',
    difficulty: 'Beginner',
    equipment: 'Bodyweight only',
    image: 'pilates.jpg',
    backgroundGradient: 'from-blue-900 to-blue-700',
    stages: [
      {
        id: 1,
        number: 1,
        title: 'Foundation Basics',
        sessions: [
          { id: 1, title: 'Pilates Fundamentals', duration: '30 min', level: 'Beginner' },
          { id: 2, title: 'Core Activation', duration: '25 min', level: 'Beginner' },
          { id: 3, title: 'Flexibility Flow', duration: '20 min', level: 'Beginner' },
        ],
      },
      {
        id: 2,
        number: 2,
        title: 'Progressive Strength',
        sessions: [
          { id: 4, title: 'Pilates Power', duration: '35 min', level: 'Beginner' },
          { id: 5, title: 'Core Challenge', duration: '30 min', level: 'Intermediate' },
          { id: 6, title: 'Stability Work', duration: '25 min', level: 'Intermediate' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Strength and Conditioning',
    description: 'Build functional strength with this structured conditioning programme',
    duration: 6,
    durationUnit: 'weeks',
    frequency: '3 sessions per week',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells and resistance bands',
    image: 'strength.jpg',
    backgroundGradient: 'from-red-900 to-orange-700',
    stages: [
      {
        id: 3,
        number: 1,
        title: 'Build Foundation',
        sessions: [
          { id: 7, title: 'Upper Body Strength', duration: '40 min', level: 'Intermediate' },
          { id: 8, title: 'Lower Body Power', duration: '40 min', level: 'Intermediate' },
          { id: 9, title: 'Full Body Conditioning', duration: '45 min', level: 'Intermediate' },
        ],
      },
      {
        id: 4,
        number: 2,
        title: 'Increase Intensity',
        sessions: [
          { id: 10, title: 'Advanced Upper Body', duration: '45 min', level: 'Intermediate' },
          { id: 11, title: 'Explosive Lower Body', duration: '45 min', level: 'Intermediate' },
          { id: 12, title: 'Total Body Power', duration: '50 min', level: 'Intermediate' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Mobility and Recovery',
    description: 'Improve your mobility and learn to move better with this recovery focused programme',
    duration: 3,
    durationUnit: 'weeks',
    frequency: '3 sessions per week',
    difficulty: 'Beginner to Intermediate',
    equipment: 'No equipment',
    image: 'mobility.jpg',
    backgroundGradient: 'from-purple-900 to-pink-700',
    stages: [
      {
        id: 5,
        number: 1,
        title: 'Mobility Basics',
        sessions: [
          { id: 13, title: 'Joint Mobility Work', duration: '30 min', level: 'Beginner' },
          { id: 14, title: 'Flexibility and Breathing', duration: '35 min', level: 'Beginner' },
          { id: 15, title: 'Recovery Stretch', duration: '25 min', level: 'Beginner' },
        ],
      },
      {
        id: 6,
        number: 2,
        title: 'Advanced Movement',
        sessions: [
          { id: 16, title: 'Movement Flow', duration: '40 min', level: 'Intermediate' },
          { id: 17, title: 'Mobility Challenge', duration: '35 min', level: 'Intermediate' },
          { id: 18, title: 'Deep Recovery Session', duration: '30 min', level: 'Intermediate' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'HIIT and Cardio Blast',
    description: 'Push your cardiovascular fitness with this high intensity interval training programme',
    duration: 4,
    durationUnit: 'weeks',
    frequency: '3 to 4 sessions per week',
    difficulty: 'Intermediate to Advanced',
    equipment: 'No equipment',
    image: 'hiit.jpg',
    backgroundGradient: 'from-yellow-900 to-orange-700',
    stages: [
      {
        id: 7,
        number: 1,
        title: 'Build Cardio Base',
        sessions: [
          { id: 19, title: 'HIIT Foundations', duration: '30 min', level: 'Intermediate' },
          { id: 20, title: 'Cardio Intervals', duration: '35 min', level: 'Intermediate' },
          { id: 21, title: 'Explosive Bursts', duration: '30 min', level: 'Intermediate' },
        ],
      },
      {
        id: 8,
        number: 2,
        title: 'Maximize Intensity',
        sessions: [
          { id: 22, title: 'Advanced HIIT', duration: '40 min', level: 'Advanced' },
          { id: 23, title: 'Max Cardio Blast', duration: '40 min', level: 'Advanced' },
          { id: 24, title: 'Peak Performance', duration: '35 min', level: 'Advanced' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Mind and Body Balance',
    description: 'Combine physical training with mindfulness and breathing work for a holistic approach to fitness',
    duration: 4,
    durationUnit: 'weeks',
    frequency: '3 sessions per week',
    difficulty: 'All levels',
    equipment: 'No equipment',
    image: null,
    backgroundGradient: 'from-teal-900 to-cyan-700',
    stages: [
      {
        id: 9,
        number: 1,
        title: 'Connect Mind and Body',
        sessions: [
          { id: 25, title: 'Mindful Movement', duration: '40 min', level: 'Beginner' },
          { id: 26, title: 'Breathing and Strength', duration: '35 min', level: 'Beginner' },
          { id: 27, title: 'Meditation Flow', duration: '30 min', level: 'Beginner' },
        ],
      },
      {
        id: 10,
        number: 2,
        title: 'Deepen Practice',
        sessions: [
          { id: 28, title: 'Advanced Mindfulness', duration: '45 min', level: 'Intermediate' },
          { id: 29, title: 'Power with Purpose', duration: '40 min', level: 'Intermediate' },
          { id: 30, title: 'Holistic Recovery', duration: '35 min', level: 'Intermediate' },
        ],
      },
    ],
  },
];

export const getProgrammeById = (id) => PROGRAMMES.find(p => p.id === parseInt(id));
export const getStageById = (programmeId, stageId) => {
  const programme = getProgrammeById(programmeId);
  return programme?.stages.find(s => s.id === parseInt(stageId));
};
