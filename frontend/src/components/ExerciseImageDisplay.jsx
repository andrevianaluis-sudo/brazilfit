import MuscleDiagram from './MuscleDiagram';
import { getExerciseMuscles, determineBestView } from '../data/exerciseMuscleMap';

export default function ExerciseImageDisplay({ exerciseName, size = 'large' }) {
  const muscles = getExerciseMuscles(exerciseName);
  const view = muscles.preferredView || determineBestView(muscles.primary);

  return (
    <div>
      <MuscleDiagram
        primaryMuscles={muscles.primary}
        secondaryMuscles={muscles.secondary}
        view={view}
        size={size}
      />
    </div>
  );
}

