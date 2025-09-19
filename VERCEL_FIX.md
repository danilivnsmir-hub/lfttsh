
# ⚠️ Исправление ошибки Vercel

## 🐛 Ошибка: "The `functions` property cannot be used in conjunction with the `builds` property"

### 🔧 **Решение 1 (Рекомендуется)**: Удалить vercel.json
```bash
# В папке workout_app/app/
rm vercel.json
```

**Почему**: Vercel автоматически распознает Next.js проекты, конфигурация не нужна.

### 🔧 **Решение 2**: Использовать минимальный vercel.json
```bash
# В папке workout_app/app/
rm vercel.json
mv vercel-minimal.json vercel.json
```

### 🔧 **Решение 3**: Если нужны заголовки безопасности
Текущий `vercel.json` уже исправлен - убраны `builds` и `functions`.

## 🚀 **Пошаговое исправление:**

### **1. Удалите старые файлы**
```bash
rm -rf .next .build node_modules
```

### **2. Исправьте конфигурацию**  
```bash
mv next.config.js next.config.js.backup
mv next.config.vercel.js next.config.js

# Выберите один вариант:
rm vercel.json  # (рекомендуется)
# ИЛИ
mv vercel-minimal.json vercel.json  # (минимальный)
```

### **3. Коммит и пуш**
```bash
git add .
git commit -m "fix: vercel config"
git push
```

### **4. Redeploy в Vercel**
Vercel автоматически пересоберет проект после push.

## ✅ **Проверка после деплоя:**
- [ ] Сайт открывается
- [ ] Можно добавить тренировку  
- [ ] Переключение вкладок работает
- [ ] Данные сохраняются

## 🆘 **Если всё еще ошибки:**

### **TypeScript/ESLint ошибки**
В `next.config.js` временно добавьте:
```javascript
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

### **Ошибки модулей**
Убедитесь, что используете `next.config.vercel.js`:
```javascript
// Должен содержать webpack config для исключения серверных модулей
```

### **Проверьте логи**
В Vercel Dashboard → Functions → View Function Logs

---

## 🎯 **Быстрое решение (30 секунд):**
```bash
cd workout_app/app/
rm vercel.json
git add .
git commit -m "remove vercel.json"
git push
```

**Готово!** Vercel пересоберет проект автоматически.
