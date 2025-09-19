
export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_custom: boolean;
}

export interface WorkoutSet {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  set_order: number;
  exercise?: Exercise;
  created_at?: string;
}

export interface Workout {
  id: number;
  name: string | null;
  date: string;
  created_at: string;
  workout_sets: WorkoutSet[];
}

export interface StatisticData {
  date: string;
  weight: number;
  reps: number;
  workout_date: string;
}

export interface Statistics {
  exercise: Exercise | null;
  data: StatisticData[];
}
