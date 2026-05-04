# 🍡 Moti: AI Tamagotchi

> **Moti** — это не просто тамагочи. Это твой цифровой питомец с настоящей «нейросетью в голове», который учится на твоих поступках.

![License](https://img.shields.io/github/license/RomanDorokhin/liveAI)
![Build Status](https://github.com/RomanDorokhin/liveAI/actions/workflows/deploy.yml/badge.svg)

## ✨ Особенности

- **🧠 Мозги на DQN (Deep Q-Learning):** Питомец использует обучение с подкреплением (Reinforcement Learning) через TensorFlow.js. Он анализирует свои показатели (голод, счастье, энергия) и принимает решения.
- **📈 Эволюция:** Моти проходит путь от яйца до мудреца. Каждая стадия открывает новые визуальные формы и возможности.
- **🧬 Мутации:** Со временем нейросеть питомца мутирует, меняя его характер и поведение.
- **☁️ Облачная синхронизация:** Состояние питомца и веса нейросети сохраняются в базе данных (Drizzle ORM + MySQL) и привязаны к твоему Telegram ID.
- **🎨 Дизайн:** Современный стек на Tailwind CSS с плавной анимацией на Framer Motion.

## 🛠 Технологии

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **AI Engine:** TensorFlow.js (DQN Brain)
- **Backend:** Express, tRPC
- **Database:** Drizzle ORM, MySQL
- **State Management:** React Query, Custom Hooks with LocalStorage fallback

## 🚀 Быстрый запуск

### Локально
1. Клонируй репозиторий:
   ```bash
   git clone https://github.com/RomanDorokhin/liveAI.git
   cd liveAI
   ```
2. Установи зависимости:
   ```bash
   pnpm install
   ```
3. Запусти режим разработки:
   ```bash
   pnpm dev
   ```

### Деплой
Проект настроен на автоматический деплой в **GitHub Pages** через GitHub Actions. Просто пушни в `main`, и новая версия сама появится в сети.

## 🕹 Играть
**[Открыть Moti в браузере](https://romandorokhin.github.io/liveAI/)**

---
Создано с любовью к коду и цифровым питомцам.
