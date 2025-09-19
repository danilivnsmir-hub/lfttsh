
'use client';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  CloudStorage: {
    setItem(key: string, value: string, callback?: (error: string | null, success?: boolean) => void): void;
    getItem(key: string, callback: (error: string | null, value?: string) => void): void;
    getItems(keys: string[], callback: (error: string | null, values?: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, success?: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, success?: boolean) => void): void;
    getKeys(callback: (error: string | null, keys?: string[]) => void): void;
  };
  ready(): void;
  close(): void;
  expand(): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

class TelegramCloudStorage {
  private webApp: TelegramWebApp | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    console.log('TelegramCloudStorage init called', window.Telegram?.WebApp);
    if (window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      
      // Инициализируем WebApp
      try {
        this.webApp.ready();
        // Разворачиваем приложение для лучшего UX
        this.webApp.expand();
        this.isInitialized = true;
        console.log('Telegram WebApp initialized successfully');
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      }
    } else {
      console.log('Telegram WebApp not available');
    }
  }

  isAvailable(): boolean {
    // Попробуем переинициализировать, если еще не инициализирован
    if (!this.isInitialized && typeof window !== 'undefined' && window.Telegram?.WebApp) {
      console.log('Reinitializing Telegram...');
      this.init();
    }
    return this.isInitialized && !!this.webApp?.CloudStorage;
  }

  reinit(): void {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  getUserId(): number | null {
    return this.webApp?.initDataUnsafe?.user?.id || null;
  }

  getUserInfo() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  private getUserKey(key: string): string {
    const userId = this.getUserId();
    return userId ? `user_${userId}_${key}` : key;
  }

  async setItem(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        console.log('🚫 Telegram Cloud Storage not available');
        reject(new Error('Telegram Cloud Storage not available'));
        return;
      }

      const userKey = this.getUserKey(key);
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      
      console.log('💾 Setting item in Telegram Cloud:', userKey, '(', valueStr.length, 'chars)');

      // Добавляем таймаут для предотвращения зависания (уменьшен до 2 секунд)
      const timeoutId = setTimeout(() => {
        console.error('❌ Telegram Cloud Storage setItem timeout');
        reject(new Error('Telegram Cloud Storage setItem timeout'));
      }, 2000);

      try {
        this.webApp!.CloudStorage.setItem(userKey, valueStr, (error) => {
          clearTimeout(timeoutId);
          if (error) {
            console.error('❌ Telegram Cloud Storage setItem error:', error);
            reject(new Error(`Telegram Cloud Storage error: ${error}`));
          } else {
            console.log('✅ Successfully saved to Telegram Cloud Storage');
            resolve();
          }
        });
      } catch (syncError) {
        clearTimeout(timeoutId);
        console.error('❌ Telegram Cloud Storage setItem sync error:', syncError);
        reject(new Error(`Telegram Cloud Storage sync error: ${syncError}`));
      }
    });
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        console.log('🚫 Telegram Cloud Storage not available for getItem');
        reject(new Error('Telegram Cloud Storage not available'));
        return;
      }

      const userKey = this.getUserKey(key);
      console.log('📥 Getting item from Telegram Cloud:', userKey);

      // Добавляем таймаут для предотвращения зависания (уменьшен до 2 секунд)
      const timeoutId = setTimeout(() => {
        console.error('❌ Telegram Cloud Storage getItem timeout');
        reject(new Error('Telegram Cloud Storage getItem timeout'));
      }, 2000);

      try {
        this.webApp!.CloudStorage.getItem(userKey, (error, value) => {
          clearTimeout(timeoutId);
          if (error) {
            console.error('❌ Telegram Cloud Storage getItem error:', error);
            reject(new Error(`Telegram Cloud Storage error: ${error}`));
          } else {
            try {
              const result = value ? JSON.parse(value) : null;
              console.log('✅ Successfully got from Telegram Cloud Storage:', userKey, result ? 'found' : 'null');
              resolve(result);
            } catch (e) {
              console.log('⚠️ Parse error, returning raw value:', value);
              resolve(value as T);
            }
          }
        });
      } catch (syncError) {
        clearTimeout(timeoutId);
        console.error('❌ Telegram Cloud Storage getItem sync error:', syncError);
        reject(new Error(`Telegram Cloud Storage sync error: ${syncError}`));
      }
    });
  }

  async getItems(keys: string[]): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Telegram Cloud Storage not available'));
        return;
      }

      const userKeys = keys.map(key => this.getUserKey(key));

      this.webApp!.CloudStorage.getItems(userKeys, (error, values) => {
        if (error) {
          reject(new Error(error));
        } else {
          const result: Record<string, any> = {};
          if (values) {
            Object.entries(values).forEach(([userKey, value]) => {
              // Extract original key from user key
              const originalKey = userKey.replace(/^user_\d+_/, '');
              try {
                result[originalKey] = JSON.parse(value);
              } catch (e) {
                result[originalKey] = value;
              }
            });
          }
          resolve(result);
        }
      });
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Telegram Cloud Storage not available'));
        return;
      }

      const userKey = this.getUserKey(key);

      this.webApp!.CloudStorage.removeItem(userKey, (error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }

  async getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Telegram Cloud Storage not available'));
        return;
      }

      this.webApp!.CloudStorage.getKeys((error, keys) => {
        if (error) {
          reject(new Error(error));
        } else {
          const userId = this.getUserId();
          const prefix = `user_${userId}_`;
          const userKeys = (keys || [])
            .filter(key => key.startsWith(prefix))
            .map(key => key.replace(prefix, ''));
          resolve(userKeys);
        }
      });
    });
  }
}

export const telegramStorage = new TelegramCloudStorage();
export default telegramStorage;
