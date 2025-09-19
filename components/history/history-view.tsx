
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Download, Calendar, Dumbbell, Eye, RefreshCw } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/workout-utils';
import { useToast } from '@/hooks/use-toast';
import { useDataManager } from '@/lib/client-data-manager';
import { Workout } from '@/lib/data-types';

export default function HistoryView() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { toast } = useToast();
  const dataManager = useDataManager();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Функция для принудительного обновления
  const refreshWorkouts = async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchWorkouts();
    toast({
      title: "Обновлено",
      description: "История тренировок обновлена",
    });
  };

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      console.log('📂 Fetching workouts from history view...');
      const data = await dataManager.getWorkouts();
      console.log('📂 Got workouts in history:', data?.length || 0);
      setWorkouts(data || []);
      
      if (data && data.length > 0) {
        console.log('📂 Sample workout:', data[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching workouts:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю тренировок",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      console.log('📤 Starting export...');
      const csvData = await dataManager.exportWorkouts();
      
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `workout_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Export successful');
        toast({
          title: "Успешно",
          description: "История тренировок экспортирована",
        });
      } else {
        toast({
          title: "Предупреждение",
          description: "Нет данных для экспорта",
        });
      }
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const openWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setDetailsOpen(true);
  };

  const getWorkoutSummary = (workout: Workout) => {
    const exerciseGroups = workout?.workout_sets?.reduce((acc, set) => {
      const exerciseName = set?.exercise?.name;
      if (exerciseName) {
        acc[exerciseName] = (acc[exerciseName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};
    
    return Object.entries(exerciseGroups)
      .map(([exercise, sets]) => `${exercise} (${sets})`)
      .join(', ');
  };

  const getTotalSets = (workout: Workout) => {
    return workout?.workout_sets?.length || 0;
  };

  const getUniqueExercises = (workout: Workout) => {
    const uniqueExercises = new Set(
      workout?.workout_sets?.map(set => set?.exercise?.name) || []
    );
    return uniqueExercises.size;
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              История тренировок
              {workouts.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({workouts.length})
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={refreshWorkouts} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Загрузка...' : 'Обновить'}
              </Button>
              <Button 
                onClick={exportToCSV} 
                disabled={exporting || workouts.length === 0}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Экспорт...' : 'CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-lg font-medium text-muted-foreground mb-2">
                Нет сохраненных тренировок
              </div>
              <div className="text-sm text-muted-foreground">
                Создайте свою первую тренировку на вкладке "Тренировка"
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Card key={workout?.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">
                            {formatDate(workout?.date)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            в {formatDateTime(workout?.date).split(', ')[1]}
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {getUniqueExercises(workout)} упражнений, {getTotalSets(workout)} подходов
                        </div>
                        
                        <div className="text-sm text-muted-foreground line-clamp-2 sm:truncate">
                          {getWorkoutSummary(workout)}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWorkoutDetails(workout)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Подробнее</span>
                          <span className="sm:hidden">Детали</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Тренировка от {selectedWorkout ? formatDate(selectedWorkout.date) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{getUniqueExercises(selectedWorkout)}</div>
                  <div className="text-sm text-muted-foreground">Упражнений</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{getTotalSets(selectedWorkout)}</div>
                  <div className="text-sm text-muted-foreground">Подходов</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatDateTime(selectedWorkout.date).split(', ')[1]}
                  </div>
                  <div className="text-sm text-muted-foreground">Время</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Подходы:</h3>
                {selectedWorkout?.workout_sets?.map((set, index) => (
                  <div key={set?.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{set?.exercise?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {set?.exercise?.muscle_group}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {set?.weight === 0 ? 'Собственный вес' : `${set?.weight} кг`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {set?.reps} повторений
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
