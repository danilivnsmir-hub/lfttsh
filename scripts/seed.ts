
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Грудь
  { name: 'Жим штанги лежа', muscle_group: 'Грудь' },
  { name: 'Жим гантелей лежа', muscle_group: 'Грудь' },
  { name: 'Жим штанги на наклонной скамье', muscle_group: 'Грудь' },
  { name: 'Жим гантелей на наклонной скамье', muscle_group: 'Грудь' },
  { name: 'Отжимания от пола', muscle_group: 'Грудь' },
  { name: 'Отжимания на брусьях', muscle_group: 'Грудь' },
  { name: 'Разведение гантелей лежа', muscle_group: 'Грудь' },
  { name: 'Пуловер с гантелей', muscle_group: 'Грудь' },

  // Спина
  { name: 'Становая тяга', muscle_group: 'Спина' },
  { name: 'Подтягивания широким хватом', muscle_group: 'Спина' },
  { name: 'Подтягивания узким хватом', muscle_group: 'Спина' },
  { name: 'Тяга штанги в наклоне', muscle_group: 'Спина' },
  { name: 'Тяга гантели в наклоне', muscle_group: 'Спина' },
  { name: 'Тяга верхнего блока', muscle_group: 'Спина' },
  { name: 'Тяга горизонтального блока', muscle_group: 'Спина' },
  { name: 'Шраги со штангой', muscle_group: 'Спина' },
  { name: 'Шраги с гантелями', muscle_group: 'Спина' },

  // Плечи
  { name: 'Жим штанги стоя', muscle_group: 'Плечи' },
  { name: 'Жим гантелей сидя', muscle_group: 'Плечи' },
  { name: 'Жим гантелей стоя', muscle_group: 'Плечи' },
  { name: 'Разведение гантелей в стороны', muscle_group: 'Плечи' },
  { name: 'Подъемы гантелей перед собой', muscle_group: 'Плечи' },
  { name: 'Разведение гантелей в наклоне', muscle_group: 'Плечи' },
  { name: 'Тяга штанги к подбородку', muscle_group: 'Плечи' },

  // Ноги
  { name: 'Приседания со штангой', muscle_group: 'Ноги' },
  { name: 'Приседания с гантелями', muscle_group: 'Ноги' },
  { name: 'Выпады со штангой', muscle_group: 'Ноги' },
  { name: 'Выпады с гантелями', muscle_group: 'Ноги' },
  { name: 'Жим ногами', muscle_group: 'Ноги' },
  { name: 'Разгибания ног', muscle_group: 'Ноги' },
  { name: 'Сгибания ног', muscle_group: 'Ноги' },
  { name: 'Подъемы на носки', muscle_group: 'Ноги' },
  { name: 'Румынская тяга', muscle_group: 'Ноги' },
  { name: 'Болгарские выпады', muscle_group: 'Ноги' },

  // Руки - Бицепс
  { name: 'Подъемы штанги на бицепс', muscle_group: 'Бицепс' },
  { name: 'Подъемы гантелей на бицепс', muscle_group: 'Бицепс' },
  { name: 'Молотки с гантелями', muscle_group: 'Бицепс' },
  { name: 'Подъемы на скамье Скотта', muscle_group: 'Бицепс' },
  { name: 'Концентрированные подъемы', muscle_group: 'Бицепс' },

  // Руки - Трицепс
  { name: 'Французский жим лежа', muscle_group: 'Трицепс' },
  { name: 'Французский жим стоя', muscle_group: 'Трицепс' },
  { name: 'Жим узким хватом', muscle_group: 'Трицепс' },
  { name: 'Разгибания рук на блоке', muscle_group: 'Трицепс' },
  { name: 'Отжимания на брусьях на трицепс', muscle_group: 'Трицепс' },

  // Пресс
  { name: 'Планка', muscle_group: 'Пресс' },
  { name: 'Скручивания', muscle_group: 'Пресс' },
  { name: 'Подъемы ног в висе', muscle_group: 'Пресс' },
  { name: 'Русские повороты', muscle_group: 'Пресс' },
  { name: 'Велосипед', muscle_group: 'Пресс' },
  { name: 'Мертвый жук', muscle_group: 'Пресс' },

  // Кардио
  { name: 'Бег на беговой дорожке', muscle_group: 'Кардио' },
  { name: 'Велотренажер', muscle_group: 'Кардио' },
  { name: 'Эллипсоид', muscle_group: 'Кардио' },
  { name: 'Прыжки на скакалке', muscle_group: 'Кардио' },
  { name: 'Берпи', muscle_group: 'Кардио' },
];

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем упражнения
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: {
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        is_custom: false,
      },
    });
  }

  console.log('✅ База данных успешно заполнена!');
  console.log(`📊 Создано ${exercises.length} упражнений`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
