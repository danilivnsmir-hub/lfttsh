
import telegramStorage from './telegram';
import { Exercise, Workout, WorkoutSet, Statistics } from './data-types';

// Fallback к localStorage если Telegram не доступен
class LocalStorageWrapper {
  async setItem(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

const localStorageWrapper = new LocalStorageWrapper();

class TelegramDataManager {
  private get storage() {
    return telegramStorage.isAvailable() ? telegramStorage : localStorageWrapper;
  }

  private defaultExercises: Exercise[] = [
    { id: 1, name: 'Жим лежа', muscle_group: 'Грудь', is_custom: false },
    { id: 2, name: 'Приседания', muscle_group: 'Ноги', is_custom: false },
    { id: 3, name: 'Становая тяга', muscle_group: 'Спина', is_custom: false },
    { id: 4, name: 'Жим стоя', muscle_group: 'Плечи', is_custom: false },
    { id: 5, name: 'Подтягивания', muscle_group: 'Спина', is_custom: false },
    { id: 6, name: 'Отжимания', muscle_group: 'Грудь', is_custom: false },
    { id: 7, name: 'Выпады', muscle_group: 'Ноги', is_custom: false },
    { id: 8, name: 'Планка', muscle_group: 'Пресс', is_custom: false },
    { id: 9, name: 'Бицепс со штангой', muscle_group: 'Руки', is_custom: false },
    { id: 10, name: 'Трицепс на брусьях', muscle_group: 'Руки', is_custom: false },
    { id: 11, name: 'Жим ногами', muscle_group: 'Ноги', is_custom: false },
    { id: 12, name: 'Тяга верхнего блока', muscle_group: 'Спина', is_custom: false },
    { id: 13, name: 'Жим гантелей', muscle_group: 'Грудь', is_custom: false },
    { id: 14, name: 'Подъемы на носки', muscle_group: 'Ноги', is_custom: false },
    { id: 15, name: 'Скручивания', muscle_group: 'Пресс', is_custom: false },
  ];

  async getExercises(): Promise<Exercise[]> {
    try {
      let exercises = await this.storage.getItem<Exercise[]>('exercises');
      if (!exercises || exercises.length === 0) {
        // Инициализируем базовые упражнения
        exercises = [...this.defaultExercises];
        await this.storage.setItem('exercises', exercises);
      }
      return exercises;
    } catch (error) {
      console.error('Error getting exercises:', error);
      return this.defaultExercises;
    }
  }

  async createExercise(name: string, muscle_group: string): Promise<Exercise> {
    try {
      const exercises = await this.getExercises();
      
      // Проверим на дубликаты
      const existing = exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        throw new Error('Exercise with this name already exists');
      }

      const newId = Math.max(...exercises.map(ex => ex.id), 0) + 1;
      const newExercise: Exercise = {
        id: newId,
        name,
        muscle_group,
        is_custom: true
      };

      exercises.push(newExercise);
      await this.storage.setItem('exercises', exercises);
      
      return newExercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  async getWorkouts(): Promise<Workout[]> {
    try {
      const workouts = await this.storage.getItem<Workout[]>('workouts') || [];
      const exercises = await this.getExercises();
      
      // Добавляем информацию об упражнениях к подходам
      return workouts.map(workout => ({
        ...workout,
        workout_sets: workout.workout_sets.map(set => ({
          ...set,
          exercise: exercises.find(ex => ex.id === set.exercise_id)
        }))
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  }

  async createWorkout(name: string | null, sets: Omit<WorkoutSet, 'id'>[]): Promise<Workout> {
    try {
      if (!sets || sets.length === 0) {
        throw new Error('Sets array is required and must not be empty');
      }

      const workouts = await this.getWorkouts();
      const exercises = await this.getExercises();
      
      const newWorkoutId = Math.max(...workouts.map(w => w.id), 0) + 1;
      const currentDate = new Date().toISOString();
      
      const newWorkoutSets: WorkoutSet[] = sets.map((set, index) => ({
        id: Date.now() + index,
        exercise_id: set.exercise_id,
        weight: set.weight,
        reps: set.reps,
        set_order: index + 1,
        created_at: currentDate,
        exercise: exercises.find(ex => ex.id === set.exercise_id)
      }));

      const newWorkout: Workout = {
        id: newWorkoutId,
        name,
        date: currentDate,
        created_at: currentDate,
        workout_sets: newWorkoutSets
      };

      workouts.push(newWorkout);
      await this.storage.setItem('workouts', workouts);
      
      return newWorkout;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  }

  async getStatistics(exercise_id: number): Promise<Statistics> {
    try {
      const workouts = await this.getWorkouts();
      const exercises = await this.getExercises();
      const exercise = exercises.find(ex => ex.id === exercise_id) || null;
      
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
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        exercise: null,
        data: []
      };
    }
  }

  async exportWorkouts(): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Error exporting workouts:', error);
      throw error;
    }
  }
}

export const telegramDataManager = new TelegramDataManager();
export default telegramDataManager;
