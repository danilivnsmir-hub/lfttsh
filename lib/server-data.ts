
import { Exercise, Workout, WorkoutSet, Statistics } from './data-types';

class ServerDataManager {
  private defaultExercises: Exercise[] = [
    // ГРУДЬ - базовые упражнения со штангой и гантелями
    { id: 1, name: 'Жим лежа', muscle_group: 'Грудь', is_custom: false },
    { id: 2, name: 'Жим лежа под углом', muscle_group: 'Грудь', is_custom: false },
    { id: 3, name: 'Жим лежа головой вниз', muscle_group: 'Грудь', is_custom: false },
    { id: 4, name: 'Жим гантелей лежа', muscle_group: 'Грудь', is_custom: false },
    { id: 5, name: 'Жим гантелей под углом', muscle_group: 'Грудь', is_custom: false },
    { id: 6, name: 'Отжимания на брусьях', muscle_group: 'Грудь', is_custom: false },
    { id: 7, name: 'Разводка гантелей', muscle_group: 'Грудь', is_custom: false },
    { id: 8, name: 'Разводка гантелей под углом', muscle_group: 'Грудь', is_custom: false },
    
    // ГРУДЬ - тренажеры
    { id: 9, name: 'Жим в тренажере', muscle_group: 'Грудь', is_custom: false },
    { id: 10, name: 'Сведение в кроссовере', muscle_group: 'Грудь', is_custom: false },
    { id: 11, name: 'Жим в машине Смита', muscle_group: 'Грудь', is_custom: false },
    { id: 12, name: 'Баттерфляй (Пек-дек)', muscle_group: 'Грудь', is_custom: false },
    
    // СПИНА - базовые упражнения
    { id: 13, name: 'Становая тяга', muscle_group: 'Спина', is_custom: false },
    { id: 14, name: 'Становая тяга сумо', muscle_group: 'Спина', is_custom: false },
    { id: 15, name: 'Румынская тяга', muscle_group: 'Спина', is_custom: false },
    { id: 16, name: 'Подтягивания', muscle_group: 'Спина', is_custom: false },
    { id: 17, name: 'Подтягивания широким хватом', muscle_group: 'Спина', is_custom: false },
    { id: 18, name: 'Подтягивания узким хватом', muscle_group: 'Спина', is_custom: false },
    { id: 19, name: 'Тяга штанги в наклоне', muscle_group: 'Спина', is_custom: false },
    { id: 20, name: 'Тяга гантели в наклоне', muscle_group: 'Спина', is_custom: false },
    { id: 21, name: 'Т-тяга', muscle_group: 'Спина', is_custom: false },
    { id: 22, name: 'Шраги со штангой', muscle_group: 'Спина', is_custom: false },
    { id: 23, name: 'Шраги с гантелями', muscle_group: 'Спина', is_custom: false },
    
    // СПИНА - тренажеры
    { id: 24, name: 'Тяга верхнего блока', muscle_group: 'Спина', is_custom: false },
    { id: 25, name: 'Тяга горизонтального блока', muscle_group: 'Спина', is_custom: false },
    { id: 26, name: 'Рычажная тяга', muscle_group: 'Спина', is_custom: false },
    { id: 27, name: 'Гиперэкстензия', muscle_group: 'Спина', is_custom: false },
    
    // НОГИ - приседания
    { id: 28, name: 'Приседания со штангой', muscle_group: 'Ноги', is_custom: false },
    { id: 29, name: 'Фронтальные приседания', muscle_group: 'Ноги', is_custom: false },
    { id: 30, name: 'Приседания с гантелями', muscle_group: 'Ноги', is_custom: false },
    { id: 31, name: 'Гоблет приседания', muscle_group: 'Ноги', is_custom: false },
    
    // НОГИ - выпады
    { id: 32, name: 'Выпады со штангой', muscle_group: 'Ноги', is_custom: false },
    { id: 33, name: 'Выпады с гантелями', muscle_group: 'Ноги', is_custom: false },
    { id: 34, name: 'Болгарские приседания', muscle_group: 'Ноги', is_custom: false },
    
    // НОГИ - тренажеры
    { id: 35, name: 'Жим ногами', muscle_group: 'Ноги', is_custom: false },
    { id: 36, name: 'Хакк-приседания', muscle_group: 'Ноги', is_custom: false },
    { id: 37, name: 'Разгибание ног', muscle_group: 'Ноги', is_custom: false },
    { id: 38, name: 'Сгибание ног', muscle_group: 'Ноги', is_custom: false },
    { id: 39, name: 'Подъемы на носки стоя', muscle_group: 'Ноги', is_custom: false },
    { id: 40, name: 'Подъемы на носки сидя', muscle_group: 'Ноги', is_custom: false },
    
    // ПЛЕЧИ - базовые жимы
    { id: 41, name: 'Жим штанги стоя', muscle_group: 'Плечи', is_custom: false },
    { id: 42, name: 'Жим штанги сидя', muscle_group: 'Плечи', is_custom: false },
    { id: 43, name: 'Жим гантелей сидя', muscle_group: 'Плечи', is_custom: false },
    { id: 44, name: 'Жим гантелей стоя', muscle_group: 'Плечи', is_custom: false },
    { id: 45, name: 'Жим Арнольда', muscle_group: 'Плечи', is_custom: false },
    
    // ПЛЕЧИ - махи и тяги
    { id: 46, name: 'Разводка гантелей в стороны', muscle_group: 'Плечи', is_custom: false },
    { id: 47, name: 'Разводка гантелей в наклоне', muscle_group: 'Плечи', is_custom: false },
    { id: 48, name: 'Подъемы гантелей перед собой', muscle_group: 'Плечи', is_custom: false },
    { id: 49, name: 'Тяга штанги к подбородку', muscle_group: 'Плечи', is_custom: false },
    
    // ПЛЕЧИ - тренажеры
    { id: 50, name: 'Жим в тренажере для плеч', muscle_group: 'Плечи', is_custom: false },
    { id: 51, name: 'Обратная разводка в тренажере', muscle_group: 'Плечи', is_custom: false },
    
    // БИЦЕПС
    { id: 52, name: 'Подъемы штанги на бицепс', muscle_group: 'Руки', is_custom: false },
    { id: 53, name: 'Подъемы EZ-штанги', muscle_group: 'Руки', is_custom: false },
    { id: 54, name: 'Подъемы гантелей на бицепс', muscle_group: 'Руки', is_custom: false },
    { id: 55, name: 'Молотки с гантелями', muscle_group: 'Руки', is_custom: false },
    { id: 56, name: 'Концентрированные подъемы', muscle_group: 'Руки', is_custom: false },
    { id: 57, name: 'Подъемы на скамье Скотта', muscle_group: 'Руки', is_custom: false },
    { id: 58, name: 'Подъемы на бицепс в кроссовере', muscle_group: 'Руки', is_custom: false },
    
    // ТРИЦЕПС
    { id: 59, name: 'Жим узким хватом', muscle_group: 'Руки', is_custom: false },
    { id: 60, name: 'Французский жим лежа', muscle_group: 'Руки', is_custom: false },
    { id: 61, name: 'Французский жим сидя', muscle_group: 'Руки', is_custom: false },
    { id: 62, name: 'Французский жим с EZ-штангой', muscle_group: 'Руки', is_custom: false },
    { id: 63, name: 'Жим гантели из-за головы', muscle_group: 'Руки', is_custom: false },
    { id: 64, name: 'Разгибание рук в блоке', muscle_group: 'Руки', is_custom: false },
    { id: 65, name: 'Разгибание руки в наклоне', muscle_group: 'Руки', is_custom: false },
    { id: 66, name: 'Отжимания на брусьях', muscle_group: 'Руки', is_custom: false },
    
    // ПРЕСС - силовые упражнения
    { id: 67, name: 'Скручивания с весом', muscle_group: 'Пресс', is_custom: false },
    { id: 68, name: 'Скручивания на блоке', muscle_group: 'Пресс', is_custom: false },
    { id: 69, name: 'Подъемы ног в висе', muscle_group: 'Пресс', is_custom: false },
    { id: 70, name: 'Подъемы коленей в висе', muscle_group: 'Пресс', is_custom: false },
    { id: 71, name: 'Русские повороты с весом', muscle_group: 'Пресс', is_custom: false },
    { id: 72, name: 'Планка с весом', muscle_group: 'Пресс', is_custom: false },
  ];

  // Простое in-memory хранилище для сервера (как fallback)
  private exercises: Exercise[] = [];
  private workouts: Workout[] = [];
  
  constructor() {
    this.exercises = [...this.defaultExercises];
  }

  async getExercises(): Promise<Exercise[]> {
    return this.exercises;
  }

  async createExercise(name: string, muscle_group: string): Promise<Exercise> {
    // Проверим на дубликаты
    const existing = this.exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Exercise with this name already exists');
    }

    const newId = Math.max(...this.exercises.map(ex => ex.id), 0) + 1;
    const newExercise: Exercise = {
      id: newId,
      name,
      muscle_group,
      is_custom: true
    };

    this.exercises.push(newExercise);
    return newExercise;
  }

  async getWorkouts(): Promise<Workout[]> {
    // Добавляем информацию об упражнениях к подходам
    return this.workouts.map(workout => ({
      ...workout,
      workout_sets: workout.workout_sets.map(set => ({
        ...set,
        exercise: this.exercises.find(ex => ex.id === set.exercise_id)
      }))
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkout(id: number): Promise<Workout | null> {
    const workouts = await this.getWorkouts();
    return workouts.find(w => w.id === id) || null;
  }

  async createWorkout(name: string | null, sets: Omit<WorkoutSet, 'id'>[]): Promise<Workout> {
    if (!sets || sets.length === 0) {
      throw new Error('Sets array is required and must not be empty');
    }

    const newWorkoutId = Math.max(...this.workouts.map(w => w.id), 0) + 1;
    const currentDate = new Date().toISOString();
    
    const newWorkoutSets: WorkoutSet[] = sets.map((set, index) => ({
      id: Date.now() + index,
      exercise_id: set.exercise_id,
      weight: set.weight,
      reps: set.reps,
      set_order: set.set_order || (index + 1),
      created_at: currentDate,
      exercise: this.exercises.find(ex => ex.id === set.exercise_id)
    }));

    const newWorkout: Workout = {
      id: newWorkoutId,
      name,
      date: currentDate,
      created_at: currentDate,
      workout_sets: newWorkoutSets
    };

    this.workouts.push(newWorkout);
    return newWorkout;
  }

  async getStatistics(exercise_id: number): Promise<Statistics> {
    const workouts = await this.getWorkouts();
    const exercise = this.exercises.find(ex => ex.id === exercise_id) || null;
    
    // Собираем все подходы для данного упражнения
    const allSets: Array<WorkoutSet & { workout: Workout }> = [];
    
    workouts.forEach(workout => {
      workout.workout_sets
        .filter(set => set.exercise_id === exercise_id)
        .forEach(set => {
          allSets.push({
            ...set,
            workout
          });
        });
    });

    // Сортируем по дате
    allSets.sort((a, b) => new Date(a.workout.date).getTime() - new Date(b.workout.date).getTime());

    // Группируем по дате и находим максимальный вес за день
    const dailyStats = allSets.reduce((acc: any[], set) => {
      const date = set.workout.date.split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (!existing) {
        acc.push({
          date,
          weight: set.weight,
          reps: set.reps,
          workout_date: set.workout.date
        });
      } else if (set.weight > existing.weight) {
        existing.weight = set.weight;
        existing.reps = set.reps;
      }
      
      return acc;
    }, []);

    return {
      exercise,
      data: dailyStats
    };
  }

  async getExercisesFromWorkouts(): Promise<Exercise[]> {
    const workouts = await this.getWorkouts();
    const usedExerciseIds = new Set<number>();
    
    workouts.forEach(workout => {
      workout.workout_sets.forEach(set => {
        if (set.exercise_id) {
          usedExerciseIds.add(set.exercise_id);
        }
      });
    });
    
    return this.exercises.filter(ex => usedExerciseIds.has(ex.id));
  }

  async exportWorkouts(): Promise<string> {
    const workouts = await this.getWorkouts();
    
    const csvHeaders = [
      'Дата тренировки',
      'Название тренировки',
      'Упражнение',
      'Группа мышц',
      'Вес (кг)',
      'Повторения',
      'Номер подхода'
    ];

    const csvRows = [];
    csvRows.push(csvHeaders.join(','));

    workouts.forEach(workout => {
      workout.workout_sets.forEach(set => {
        const row = [
          workout.date.split('T')[0],
          workout.name || 'Тренировка',
          set.exercise?.name || 'Неизвестное упражнение',
          set.exercise?.muscle_group || 'Неизвестная группа',
          set.weight,
          set.reps,
          set.set_order
        ];
        csvRows.push(row.join(','));
      });
    });

    return csvRows.join('\n');
  }
}

export const serverDataManager = new ServerDataManager();
export default serverDataManager;
