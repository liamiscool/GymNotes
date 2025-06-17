# 💪 GymNotes

An iOS-first gym workout tracking app built with React Native (Expo). GymNotes feels like Apple Notes but is purpose-built for workout tracking - extremely fast, beautiful, and distraction-free.

## 🎯 Core Concept

GymNotes combines the familiar feel of Apple Notes with powerful workout-specific features:

- **Chat-like Input**: Type exercises naturally like "3x10 bench press @60kg"
- **Manual Table Input**: Structured table interface similar to Notion/Apple Notes
- **Apple Notes Aesthetic**: Clean, minimalist design following iOS patterns
- **Offline-first**: SQLite local storage with optional cloud sync

## ✨ Features

### 🗣️ **Natural Language Input**
- Type exercises in plain English: "squat 100x5 rpe 8" 
- Smart parsing handles multiple formats
- Automatic exercise recognition and emoji assignment

### 📊 **Manual Table Interface** 
- Notion-style collapsible exercise sections
- Interactive table with editable cells for sets, weight, reps, RIR
- Equipment tags and exercise metadata
- Auto-calculated 10RM based on weight + reps + RIR
- Completion tracking with visual checkmarks

### 🎨 **Apple Notes Design**
- Exact iOS typography and spacing
- System dark/light mode support
- Apple's color palette and design patterns
- Smooth animations and transitions

### 💾 **Data Management**
- SQLite local storage for offline-first experience
- Automatic session management
- Workout history with Apple Notes-style list
- Exercise parsing and structured data storage

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo SDK 53
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Database**: SQLite (expo-sqlite) for local storage
- **Styling**: React Native StyleSheet with custom theming
- **State Management**: React Context
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gymnotes.git
   cd gymnotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator  
   npm run android
   
   # Web browser
   npm run web
   ```

## 📱 Development Commands

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Type checking
npx tsc --noEmit
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   └── ManualWorkoutTable.tsx
├── contexts/            # React contexts (theme, etc.)
│   └── ThemeContext.tsx
├── navigation/          # Navigation setup
│   └── AppNavigator.tsx
├── screens/            # App screens
│   ├── onboarding/     # Onboarding flow
│   ├── workout/        # Workout-related screens
│   ├── WorkoutsScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # Database and API services
│   └── database.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
    └── workoutParser.ts
```

## 🎨 Design System

### Colors
- **Light Mode**: Pure white backgrounds, iOS gray text colors
- **Dark Mode**: iOS dark colors (#1C1C1E, #2C2C2E)
- **Accents**: iOS blue (#007AFF) and orange (#FF9500)

### Typography
- **System Fonts**: iOS font weights (400, 500, 600, 700)
- **Hierarchy**: 34pt titles, 17pt body, proper line heights
- **Spacing**: Apple's 20px horizontal padding, proper vertical rhythm

## 📊 Database Schema

### workout_sessions
- `id` (TEXT PRIMARY KEY)
- `date` (DATE)
- `title` (TEXT)
- `duration` (INTEGER)
- `is_completed` (BOOLEAN)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### workout_sets
- `id` (TEXT PRIMARY KEY)
- `session_id` (TEXT, FK)
- `exercise` (TEXT)
- `sets` (INTEGER)
- `reps` (INTEGER)
- `weight` (REAL)
- `notes` (TEXT)
- `rpe` (INTEGER)
- `timestamp` (DATETIME)

### user_profile
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT)
- `current_streak` (INTEGER)
- `longest_streak` (INTEGER)
- `total_workouts` (INTEGER)
- `is_pro` (BOOLEAN)
- `created_at` (DATETIME)

## 🔄 Workout Parser

The app includes a smart workout parser that handles multiple input formats:

```typescript
// Supported formats:
"3x10 bench press @60kg"
"squat 100x5 rpe 8" 
"deadlift 3x5 @100kg felt easy"
"bench press 3x10 60kg"
"ohp 40x8"
```

## 🎯 Roadmap

### v1.0 (MVP)
- [x] Chat-like workout input
- [x] Manual table interface
- [x] Apple Notes design
- [x] SQLite local storage
- [x] Exercise parsing
- [ ] Workout templates
- [ ] Basic analytics

### v1.1
- [ ] iCloud sync
- [ ] Exercise library
- [ ] Workout sharing
- [ ] Progress photos

### v1.2
- [ ] Apple Health integration
- [ ] AI workout suggestions
- [ ] Social features
- [ ] Premium features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature` 
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Apple Notes and Notion's clean design
- Built with Expo for rapid development
- Uses iOS design patterns and typography

## 📞 Support

- 📧 Email: support@gymnotes.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/gymnotes/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/gymnotes/discussions)

---

**Made with 💪 for the fitness community**