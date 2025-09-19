
'use client';

import { useTelegram } from '@/components/telegram-provider';
import { Exercise, Workout, WorkoutSet, Statistics } from './data-types';

// Fallback к localStorage если Telegram не доступен
class LocalStorageManager {
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

class ClientDataManager {
  private localStorageManager = new LocalStorageManager();
  private isClient = typeof window !== 'undefined';
  
  // Кеширование для улучшения производительности
  private exercisesCache: Exercise[] | null = null;
  private workoutsCache: Workout[] | null = null;
  private lastExercisesFetch = 0;
  private lastWorkoutsFetch = 0;
  private cacheTimeout = 30000; // 30 секунд
  
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

  constructor(private telegramStorage: any, private isAvailable: boolean) {}

  private get storage() {
    return this.isAvailable ? this.telegramStorage : this.localStorageManager;
  }

  private async makeApiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.isClient) {
      throw new Error('API calls can only be made on client side');
    }
    
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getExercises(): Promise<Exercise[]> {
    if (!this.isClient) return this.defaultExercises;

    // Проверяем кеш
    const now = Date.now();
    if (this.exercisesCache && (now - this.lastExercisesFetch) < this.cacheTimeout) {
      console.log('📦 Using cached exercises');
      return this.exercisesCache;
    }

    try {
      console.log('💪 Loading exercises...');
      let exercises: Exercise[];
      
      if (this.isAvailable) {
        // Используем Telegram Cloud Storage
        let storedExercises = await this.storage.getItem('exercises') as Exercise[] | null;
        let exercisesVersion = await this.storage.getItem('exercisesVersion') as number | null;
        
        // Версия упражнений (увеличиваем при обновлении списка)
        const currentVersion = 4; // Увеличено для обновления до базовых силовых упражнений
        
        // Если упражнений нет, версия устарела, или их меньше ожидаемого количества - обновляем
        if (!storedExercises || !exercisesVersion || exercisesVersion < currentVersion || storedExercises.length < 72) {
          exercises = [...this.defaultExercises];
          await this.storage.setItem('exercises', exercises);
          await this.storage.setItem('exercisesVersion', currentVersion);
          console.log('Упражнения обновлены до версии', currentVersion, '- всего:', exercises.length);
        } else {
          exercises = storedExercises;
        }
      } else {
        // Fallback к API для обычных пользователей
        exercises = await this.makeApiCall<Exercise[]>('/api/exercises');
      }
      
      // Сохраняем в кеш
      this.exercisesCache = exercises;
      this.lastExercisesFetch = now;
      
      return exercises;
    } catch (error) {
      console.error('Error getting exercises:', error);
      // Возвращаем кеш если есть, иначе дефолтные
      return this.exercisesCache || this.defaultExercises;
    }
  }

  async createExercise(name: string, muscle_group: string): Promise<Exercise> {
    if (!this.isClient) throw new Error('Cannot create exercise on server');

    try {
      if (this.isAvailable) {
        // Используем Telegram Cloud Storage
        const exercises = await this.getExercises();
        
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
        
        // Сбрасываем кеш упражнений
        this.exercisesCache = null;
        this.lastExercisesFetch = 0;
        
        return newExercise;
      } else {
        // Fallback к API
        return await this.makeApiCall<Exercise>('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, muscle_group })
        });
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  async getWorkouts(): Promise<Workout[]> {
    if (!this.isClient) return [];

    // Проверяем кеш (более короткий таймаут для тренировок - 10 секунд)
    const now = Date.now();
    if (this.workoutsCache && (now - this.lastWorkoutsFetch) < 10000) {
      console.log('📦 Using cached workouts');
      return this.workoutsCache;
    }

    try {
      console.log('🏋️ Loading workouts...');
      let workouts: Workout[];
      
      if (this.isAvailable) {
        // Используем Telegram Cloud Storage
        const storedWorkouts = (await this.storage.getItem('workouts') as Workout[] | null) || [];
        const exercises = await this.getExercises(); // Это уже может быть из кеша
        
        workouts = storedWorkouts.map((workout: Workout) => ({
          ...workout,
          workout_sets: workout.workout_sets.map((set: WorkoutSet) => ({
            ...set,
            exercise: exercises.find((ex: Exercise) => ex.id === set.exercise_id)
          }))
        })).sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        // Fallback к API
        workouts = await this.makeApiCall<Workout[]>('/api/workouts');
      }
      
      // Сохраняем в кеш
      this.workoutsCache = workouts;
      this.lastWorkoutsFetch = now;
      
      return workouts;
    } catch (error) {
      console.error('Error getting workouts:', error);
      // Возвращаем кеш если есть
      return this.workoutsCache || [];
    }
  }

  async createWorkout(name: string | null, sets: Omit<WorkoutSet, 'id'>[]): Promise<Workout> {
    if (!this.isClient) throw new Error('Cannot create workout on server');

    console.log('🔄 createWorkout called with:', { name, setsCount: sets?.length, isAvailable: this.isAvailable });

    try {
      if (!sets || sets.length === 0) {
        throw new Error('Sets array is required and must not be empty');
      }

      if (this.isAvailable) {
        console.log('📱 Using Telegram Cloud Storage');
        // Используем Telegram Cloud Storage
        
        console.log('📂 Getting existing workouts...');
        const workouts = await this.getWorkouts();
        console.log('📂 Got workouts:', workouts?.length || 0);
        
        console.log('💪 Getting exercises...');
        const exercises = await this.getExercises();
        console.log('💪 Got exercises:', exercises?.length || 0);
        
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

        console.log('💾 Saving workout to Telegram Cloud:', newWorkout);
        workouts.push(newWorkout);
        
        // Добавляем timeout для предотвращения зависания (уменьшен до 3 секунд)
        const savePromise = this.storage.setItem('workouts', workouts);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Telegram Cloud Storage timeout')), 3000);
        });
        
        await Promise.race([savePromise, timeoutPromise]);
        console.log('✅ Workout saved successfully to Telegram Cloud');
        
        // Сбрасываем кеш тренировок, чтобы данные обновились
        this.workoutsCache = null;
        this.lastWorkoutsFetch = 0;
        
        return newWorkout;
      } else {
        console.log('🌐 Using API fallback');
        // Fallback к API
        const result = await this.makeApiCall<Workout>('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, sets })
        });
        console.log('✅ Workout saved successfully via API');
        
        // Сбрасываем кеш тренировок
        this.workoutsCache = null;
        this.lastWorkoutsFetch = 0;
        
        return result;
      }
    } catch (error) {
      console.error('❌ Error creating workout:', error);
      
      // Если Telegram Cloud не работает, попробуем fallback к API
      if (this.isAvailable && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('Cloud Storage'))) {
        console.log('🔄 Telegram Cloud failed, trying API fallback...');
        try {
          const result = await this.makeApiCall<Workout>('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, sets })
          });
          console.log('✅ Workout saved successfully via API fallback');
          return result;
        } catch (apiError) {
          console.error('❌ API fallback also failed:', apiError);
          throw new Error('Не удалось сохранить тренировку. Проверьте подключение к интернету.');
        }
      }
      
      throw error;
    }
  }

  async getStatistics(exercise_id: number): Promise<Statistics> {
    if (!this.isClient) return { exercise: null, data: [] };

    try {
      if (this.isAvailable) {
        // Используем Telegram Cloud Storage
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

        return { exercise, data: dailyStats };
      } else {
        // Fallback к API
        return await this.makeApiCall<Statistics>(`/api/statistics?exercise_id=${exercise_id}`);
      }
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { exercise: null, data: [] };
    }
  }

  async exportWorkouts(): Promise<string> {
    if (!this.isClient) return '';

    try {
      if (this.isAvailable) {
        // Используем Telegram Cloud Storage
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
      } else {
        // Fallback к API
        const response = await fetch('/api/export');
        return await response.text();
      }
    } catch (error) {
      console.error('Error exporting workouts:', error);
      throw error;
    }
  }
}

export function useDataManager() {
  const { isAvailable, storage } = useTelegram();
  return new ClientDataManager(storage, isAvailable);
}
