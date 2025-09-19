
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Dumbbell, Save, FileText } from 'lucide-react';
import { generateWeightOptions, generateRepsOptions, groupExercisesByMuscle } from '@/lib/workout-utils';
import { useDataManager } from '@/lib/client-data-manager';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/lib/data-types';

interface WorkoutSet {
  exercise_id: number;
  exercise_name?: string;
  muscle_group?: string;
  weight: number;
  reps: number;
}

// Ключи для localStorage
const DRAFT_KEY = 'workout-draft';

// Интерфейс для черновика тренировки
interface WorkoutDraft {
  currentSets: WorkoutSet[];
  selectedExercise: string;
  selectedWeight: string;
  selectedReps: string;
  isSupersetMode: boolean;
  selectedExercise2: string;
  selectedWeight2: string;
  selectedReps2: string;
}

export default function WorkoutTracker() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [selectedReps, setSelectedReps] = useState<string>('');
  const [isSupersetMode, setIsSupersetMode] = useState(false);
  const [selectedExercise2, setSelectedExercise2] = useState<string>('');
  const [selectedWeight2, setSelectedWeight2] = useState<string>('');
  const [selectedReps2, setSelectedReps2] = useState<string>('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const { toast } = useToast();
  const dataManager = useDataManager();
  const weightOptions = generateWeightOptions();
  const repsOptions = generateRepsOptions();

  // Refs для отслеживания scroll events
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Функции для работы с черновиком
  const saveDraft = (draft: WorkoutDraft) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Ошибка сохранения черновика:', error);
    }
  };

  const loadDraft = (): WorkoutDraft | null => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Ошибка загрузки черновика:', error);
      return null;
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Ошибка очистки черновика:', error);
    }
  };

  // Загружаем упражнения и черновик при монтировании компонента
  useEffect(() => {
    fetchExercises();
    
    // Загружаем сохраненный черновик
    const draft = loadDraft();
    if (draft) {
      setCurrentSets(draft.currentSets || []);
      setSelectedExercise(draft.selectedExercise || '');
      setSelectedWeight(draft.selectedWeight || '');
      setSelectedReps(draft.selectedReps || '');
      setIsSupersetMode(draft.isSupersetMode || false);
      setSelectedExercise2(draft.selectedExercise2 || '');
      setSelectedWeight2(draft.selectedWeight2 || '');
      setSelectedReps2(draft.selectedReps2 || '');
      
      // Показываем уведомление о восстановлении черновика
      if (draft.currentSets?.length > 0 || draft.selectedExercise) {
        toast({
          title: "Черновик восстановлен",
          description: "Ваши несохраненные данные восстановлены",
        });
      }
    }

    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Автосохранение черновика при изменении данных
  useEffect(() => {
    const draft: WorkoutDraft = {
      currentSets,
      selectedExercise,
      selectedWeight,
      selectedReps,
      isSupersetMode,
      selectedExercise2,
      selectedWeight2,
      selectedReps2,
    };
    
    // Сохраняем только если есть какие-то данные
    if (currentSets.length > 0 || selectedExercise || selectedWeight || selectedReps || 
        selectedExercise2 || selectedWeight2 || selectedReps2) {
      saveDraft(draft);
    }
  }, [currentSets, selectedExercise, selectedWeight, selectedReps, isSupersetMode, 
      selectedExercise2, selectedWeight2, selectedReps2]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await dataManager.getExercises();
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить упражнения",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomExercise = async () => {
    if (!customExerciseName?.trim() || !customMuscleGroup?.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название упражнения и группу мышц",
        variant: "destructive",
      });
      return;
    }

    try {
      const newExercise = await dataManager.createExercise(
        customExerciseName.trim(),
        customMuscleGroup.trim()
      );
      
      setExercises([...exercises, newExercise]);
      setCustomExerciseName('');
      setCustomMuscleGroup('');
      setIsAddingCustom(false);
      toast({
        title: "Успешно",
        description: "Упражнение добавлено",
      });
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      const message = error instanceof Error ? error.message : "Не удалось добавить упражнение";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    }
  };

  const addSet = () => {
    if (isSupersetMode) {
      // Режим суперсета - проверяем оба упражнения
      if (!selectedExercise || !selectedWeight || !selectedReps || 
          !selectedExercise2 || !selectedWeight2 || !selectedReps2) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля для обоих упражнений в суперсете",
          variant: "destructive",
        });
        return;
      }

      const exercise1 = exercises.find(ex => ex.id.toString() === selectedExercise);
      const exercise2 = exercises.find(ex => ex.id.toString() === selectedExercise2);
      
      if (!exercise1 || !exercise2) return;

      const newSet1: WorkoutSet = {
        exercise_id: exercise1.id,
        exercise_name: exercise1.name,
        muscle_group: exercise1.muscle_group,
        weight: parseFloat(selectedWeight),
        reps: parseInt(selectedReps),
      };

      const newSet2: WorkoutSet = {
        exercise_id: exercise2.id,
        exercise_name: exercise2.name,
        muscle_group: exercise2.muscle_group,
        weight: parseFloat(selectedWeight2),
        reps: parseInt(selectedReps2),
      };

      setCurrentSets([...currentSets, newSet1, newSet2]);
    } else {
      // Обычный режим - одно упражнение
      if (!selectedExercise || !selectedWeight || !selectedReps) {
        toast({
          title: "Ошибка",
          description: "Выберите упражнение, вес и количество повторений",
          variant: "destructive",
        });
        return;
      }

      const exercise = exercises.find(ex => ex.id.toString() === selectedExercise);
      if (!exercise) return;

      const newSet: WorkoutSet = {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.muscle_group,
        weight: parseFloat(selectedWeight),
        reps: parseInt(selectedReps),
      };

      setCurrentSets([...currentSets, newSet]);
    }

    // НЕ очищаем сохраненные значения для быстрого повторного ввода
  };

  const removeSet = (index: number) => {
    setCurrentSets(currentSets.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (currentSets.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы один подход",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await dataManager.createWorkout(
        null, // название тренировки
        currentSets.map((set, index) => ({
          exercise_id: set.exercise_id,
          weight: set.weight,
          reps: set.reps,
          set_order: index + 1,
        }))
      );

      // Очищаем все данные и черновик после успешного сохранения
      setCurrentSets([]);
      setSelectedExercise('');
      setSelectedWeight('');
      setSelectedReps('');
      setSelectedExercise2('');
      setSelectedWeight2('');
      setSelectedReps2('');
      setIsSupersetMode(false);
      clearDraft();
      
      toast({
        title: "Успешно",
        description: "Тренировка сохранена в историю!",
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      const message = error instanceof Error ? error.message : "Не удалось сохранить тренировку";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearCurrentWorkout = () => {
    setCurrentSets([]);
    setSelectedExercise('');
    setSelectedWeight('');
    setSelectedReps('');
    setSelectedExercise2('');
    setSelectedWeight2('');
    setSelectedReps2('');
    setIsSupersetMode(false);
    clearDraft();
    
    toast({
      title: "Черновик очищен",
      description: "Данные текущей тренировки удалены",
    });
  };

  const groupedExercises = groupExercisesByMuscle(exercises);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Добавить подход
          </CardTitle>
          {exercises.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Доступно {exercises.length} упражнений в базе данных
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Переключатель режима суперсета */}
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <Switch
              id="superset-mode"
              checked={isSupersetMode}
              onCheckedChange={setIsSupersetMode}
            />
            <Label htmlFor="superset-mode">
              Режим суперсета (два упражнения)
            </Label>
          </div>

          {/* Первое упражнение */}
          <div className="space-y-2">
            <Label>Упражнение {isSupersetMode ? '1' : ''}</Label>
            <div className="flex gap-2">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="touch-manipulation">
                  <SelectValue placeholder="Выберите упражнение" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh] overflow-y-auto">
                  {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                        {group} ({groupExercises?.length || 0} упражнений)
                      </div>
                      {groupExercises?.map((exercise) => (
                        <SelectItem 
                          key={exercise?.id} 
                          value={exercise?.id?.toString() || ''}
                          className="touch-manipulation py-3"
                        >
                          {exercise?.name}
                          {exercise?.is_custom && ' (Кастом)'}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить упражнение</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="exercise-name">Название упражнения</Label>
                      <Input
                        id="exercise-name"
                        value={customExerciseName}
                        onChange={(e) => setCustomExerciseName(e.target.value)}
                        placeholder="Введите название"
                      />
                    </div>
                    <div>
                      <Label htmlFor="muscle-group">Группа мышц</Label>
                      <Input
                        id="muscle-group"
                        value={customMuscleGroup}
                        onChange={(e) => setCustomMuscleGroup(e.target.value)}
                        placeholder="Например: Грудь, Спина, Ноги..."
                      />
                    </div>
                    <Button onClick={addCustomExercise} className="w-full">
                      Добавить упражнение
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Вес</Label>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger className="touch-manipulation">
                  <SelectValue placeholder="Выберите вес" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] overflow-y-auto">
                  {weightOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value.toString()}
                      className="touch-manipulation py-3"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Повторения</Label>
              <Select value={selectedReps} onValueChange={setSelectedReps}>
                <SelectTrigger className="touch-manipulation">
                  <SelectValue placeholder="Повторения" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] overflow-y-auto">
                  {repsOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value.toString()}
                      className="touch-manipulation py-3"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Второе упражнение (только в режиме суперсета) */}
          {isSupersetMode && (
            <>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label>Упражнение 2</Label>
                  <Select value={selectedExercise2} onValueChange={setSelectedExercise2}>
                    <SelectTrigger className="touch-manipulation">
                      <SelectValue placeholder="Выберите второе упражнение" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh] overflow-y-auto">
                      {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                            {group} ({groupExercises?.length || 0} упражнений)
                          </div>
                          {groupExercises?.map((exercise) => (
                            <SelectItem 
                              key={exercise?.id} 
                              value={exercise?.id?.toString() || ''}
                              className="touch-manipulation py-3"
                            >
                              {exercise?.name}
                              {exercise?.is_custom && ' (Кастом)'}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Вес</Label>
                    <Select value={selectedWeight2} onValueChange={setSelectedWeight2}>
                      <SelectTrigger className="touch-manipulation">
                        <SelectValue placeholder="Выберите вес" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[40vh] overflow-y-auto">
                        {weightOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                            className="touch-manipulation py-3"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Повторения</Label>
                    <Select value={selectedReps2} onValueChange={setSelectedReps2}>
                      <SelectTrigger className="touch-manipulation">
                        <SelectValue placeholder="Повторения" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[40vh] overflow-y-auto">
                        {repsOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                            className="touch-manipulation py-3"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button onClick={addSet} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isSupersetMode ? 'Добавить суперсет' : 'Добавить подход'}
          </Button>
        </CardContent>
      </Card>

      {currentSets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Текущая тренировка ({currentSets.length} подходов)
                <span className="text-sm font-normal text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  Черновик
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCurrentWorkout}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentSets.map((set, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{set?.exercise_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {set?.weight === 0 ? 'Собственный вес' : `${set?.weight} кг`} × {set?.reps} раз
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSet(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button 
                onClick={saveWorkout} 
                disabled={saving} 
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить тренировку в историю'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded-lg">
              💾 Данные автоматически сохраняются как черновик и восстановятся при перезагрузке страницы
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
