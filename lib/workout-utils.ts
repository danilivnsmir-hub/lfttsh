
// Генерация опций весов: до 20кг с шагом 0.5кг, далее с шагом 2.5кг
export function generateWeightOptions(): { value: number; label: string }[] {
  const options: { value: number; label: string }[] = [];
  
  // Собственный вес
  options.push({ value: 0, label: 'Собственный вес' });
  
  // 0.5 - 20 кг с шагом 0.5
  for (let weight = 0.5; weight <= 20; weight += 0.5) {
    options.push({ 
      value: weight, 
      label: `${weight} кг`
    });
  }
  
  // 22.5 - 200 кг с шагом 2.5
  for (let weight = 22.5; weight <= 200; weight += 2.5) {
    options.push({ 
      value: weight, 
      label: `${weight} кг`
    });
  }
  
  return options;
}

// Генерация опций повторений: от 1 до 50
export function generateRepsOptions(): { value: number; label: string }[] {
  const options: { value: number; label: string }[] = [];
  
  for (let reps = 1; reps <= 50; reps++) {
    options.push({ 
      value: reps, 
      label: `${reps}`
    });
  }
  
  return options;
}

// Группировка упражнений по группам мышц
export function groupExercisesByMuscle(exercises: any[]): Record<string, any[]> {
  return exercises?.reduce((groups, exercise) => {
    const group = exercise?.muscle_group || 'Другие';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {} as Record<string, any[]>) || {};
}

// Форматирование даты для отображения
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Форматирование времени для отображения
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
