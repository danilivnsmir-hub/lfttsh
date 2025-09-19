
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, TrendingUp, History, Menu, Users, Cloud, AlertCircle } from 'lucide-react';
import { useTelegram } from '@/components/telegram-provider';
import WorkoutTracker from '@/components/workout/workout-tracker';
import StatisticsView from '@/components/statistics/statistics-view';
import HistoryView from '@/components/history/history-view';
import { motion } from 'framer-motion';

export default function WorkoutApp() {
  const [activeTab, setActiveTab] = useState('workout');
  const { isAvailable, user } = useTelegram();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-600 text-white flex-shrink-0">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Дневник тренировок
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Отслеживайте прогресс и достигайте целей
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAvailable && user ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <Cloud className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Telegram Cloud</span>
                    <span className="sm:hidden">Cloud</span>
                  </Badge>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.first_name}</p>
                    <p className="text-xs text-gray-500">Данные синхронизируются</p>
                  </div>
                </div>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Локально
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <motion.div {...fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div 
              className="flex justify-center mb-6 sm:mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="p-1 w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 gap-1 touch-manipulation">
                  <TabsTrigger 
                    value="workout" 
                    onClick={() => setActiveTab('workout')}
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white cursor-pointer touch-manipulation py-2 px-2 sm:px-4"
                  >
                    <Dumbbell className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Тренировка</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="statistics"
                    onClick={() => setActiveTab('statistics')}
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white cursor-pointer touch-manipulation py-2 px-2 sm:px-4"
                  >
                    <TrendingUp className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Статистика</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    onClick={() => setActiveTab('history')}
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white cursor-pointer touch-manipulation py-2 px-2 sm:px-4"
                  >
                    <History className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">История</span>
                  </TabsTrigger>
                </TabsList>
              </Card>
            </motion.div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="workout" className="mt-0">
                <WorkoutTracker />
              </TabsContent>

              <TabsContent value="statistics" className="mt-0">
                <StatisticsView />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <HistoryView />
              </TabsContent>
            </motion.div>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="mt-12 py-8 text-center text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm">
            Дневник тренировок - ваш путь к достижению фитнес-целей
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
