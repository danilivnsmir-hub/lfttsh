
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import telegramStorage from '@/lib/telegram';
import { useToast } from '@/hooks/use-toast';

interface TelegramContextType {
  isAvailable: boolean;
  isInitialized: boolean;
  user: any | null;
  storage: typeof telegramStorage;
}

const TelegramContext = createContext<TelegramContextType>({
  isAvailable: false,
  isInitialized: false,
  user: null,
  storage: telegramStorage,
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: React.ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initTelegram = () => {
      console.log('Initializing Telegram...', window.Telegram?.WebApp);
      
      // Проверяем доступность Telegram Web App
      const available = telegramStorage.isAvailable();
      const userInfo = telegramStorage.getUserInfo();
      
      console.log('Telegram available:', available, 'User:', userInfo);
      
      setIsAvailable(available);
      setUser(userInfo);
      setIsInitialized(true);

      if (available && userInfo) {
        toast({
          title: "Подключено к Telegram",
          description: `Добро пожаловать, ${userInfo.first_name}! Ваши данные будут синхронизироваться с Telegram Cloud.`,
        });
      } else {
        // Если Telegram не доступен, показываем предупреждение
        console.log('Telegram not available, falling back to localStorage');
        toast({
          title: "Работа без Telegram",
          description: "Данные будут сохраняться только локально. Для синхронизации с облаком запустите приложение из Telegram.",
        });
      }
    };

    // Инициализируем сразу или ждем загрузки Telegram Web App
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp) {
        // Telegram уже доступен
        initTelegram();
      } else {
        console.log('Waiting for Telegram to load...');
        // Ждем загрузки скрипта Telegram
        const checkTelegram = setInterval(() => {
          if (window.Telegram?.WebApp) {
            console.log('Telegram loaded!');
            clearInterval(checkTelegram);
            // Переинициализируем telegramStorage
            telegramStorage.reinit();
            initTelegram();
          }
        }, 100);

        // Таймаут для случая, если Telegram не загрузится
        const timeout = setTimeout(() => {
          console.log('Telegram timeout, initializing without it');
          clearInterval(checkTelegram);
          initTelegram();
        }, 3000);

        return () => {
          clearInterval(checkTelegram);
          clearTimeout(timeout);
        };
      }
    }
  }, [toast]);

  return (
    <TelegramContext.Provider value={{
      isAvailable,
      isInitialized,
      user,
      storage: telegramStorage,
    }}>
      {children}
    </TelegramContext.Provider>
  );
}
