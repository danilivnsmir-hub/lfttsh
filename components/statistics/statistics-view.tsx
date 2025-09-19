
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { formatDate, groupExercisesByMuscle } from '@/lib/workout-utils';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_custom: boolean;
}

interface StatData {
  date: string;
  weight: number;
  reps: number;
  workout_date: string;
}

interface StatisticsData {
  exercise: Exercise | null;
  data: StatData[];
}

export default function StatisticsView() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchStatistics(selectedExercise);
    } else {
      setStatisticsData(null);
    }
  }, [selectedExercise]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data || []);
      }
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

  const fetchStatistics = async (exerciseId: string) => {
    try {
      setLoadingStats(true);
      const response = await fetch(`/api/statistics?exercise_id=${exerciseId}`);
      if (response.ok) {
        const data = await response.json();
        setStatisticsData(data);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить статистику",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const groupedExercises = groupExercisesByMuscle(exercises);
  const chartData = statisticsData?.data?.map(item => ({
    date: formatDate(item.date),
    weight: item.weight,
    reps: item.reps,
    fullDate: new Date(item.date).toLocaleDateString('ru-RU')
  })) || [];

  const getProgressStats = () => {
    if (!chartData || chartData.length === 0) return null;

    const firstWeight = chartData[0]?.weight || 0;
    const lastWeight = chartData[chartData.length - 1]?.weight || 0;
    const maxWeight = Math.max(...chartData.map(d => d.weight || 0));
    const improvement = lastWeight - firstWeight;
    const improvementPercent = firstWeight > 0 ? (improvement / firstWeight) * 100 : 0;

    return {
      maxWeight,
      improvement,
      improvementPercent,
      totalWorkouts: chartData.length
    };
  };

  const stats = getProgressStats();

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
            <TrendingUp className="h-5 w-5" />
            Статистика упражнений
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Выберите упражнение</Label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="touch-manipulation">
                <SelectValue placeholder="Выберите упражнение для просмотра статистики" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh] overflow-y-auto touch-manipulation">
                {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                  <div key={group}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                      {group}
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
        </CardContent>
      </Card>

      {loadingStats && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {statisticsData && chartData.length > 0 && !loadingStats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Максимальный вес</div>
                <div className="text-2xl font-bold">
                  {stats?.maxWeight === 0 ? 'Собств.' : `${stats?.maxWeight} кг`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Прогресс</div>
                <div className="text-2xl font-bold text-green-600">
                  {(stats?.improvement ?? 0) > 0 ? '+' : ''}{stats?.improvement ?? 0} кг
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Улучшение</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(stats?.improvementPercent ?? 0) > 0 ? '+' : ''}{(stats?.improvementPercent ?? 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Тренировок</div>
                <div className="text-2xl font-bold">{stats?.totalWorkouts}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Прогресс по весам - {statisticsData?.exercise?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      label={{ 
                        value: 'Вес (кг)', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { textAnchor: 'middle', fontSize: 11 } 
                      }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Дата: ${label}`}
                      formatter={(value, name) => [`${value} кг`, 'Вес']}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {statisticsData && chartData.length === 0 && !loadingStats && (
        <Card>
          <CardContent className="py-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">
              Нет данных для отображения
            </div>
            <div className="text-sm text-muted-foreground">
              Выполните тренировки с выбранным упражнением, чтобы увидеть прогресс
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedExercise && (
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">
              Выберите упражнение
            </div>
            <div className="text-sm text-muted-foreground">
              Выберите упражнение из списка выше, чтобы посмотреть статистику прогресса
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
