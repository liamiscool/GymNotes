# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymNotes is a mobile-first workout tracking app that feels like a hybrid between Apple Notes and a chat interface. It prioritizes simplicity, speed, and ease of input - the opposite of bloated workout apps. Users log workouts in natural language that gets parsed into structured, beautiful entries.

## Tech Stack & Architecture

### Frontend
- **React Native with Expo SDK 53** ✅
  - Perfect for iOS-first development with Android compatibility
  - Expo provides native iOS feel and performance
  - All required functionality available (SQLite, notifications, sharing, etc.)
  - Faster development cycle than native SwiftUI

### Database Strategy
- **SQLite (expo-sqlite)** for local storage ✅
  - Instant writes, no network latency - as fast as Apple Notes
  - Offline-first approach ensures speed and reliability
  - Supabase sync added later as optional cloud backup
  - This is the same pattern used by Apple Notes, WhatsApp, etc.

### Navigation & State
- **React Navigation** (Stack + Bottom Tabs)
- **React Context** for theme, user state, and workout sessions
- **TypeScript** for type safety and better DX

### Monetization Integration
- **RevenueCat** or **Superwall** for subscription management
- **Expo In-App Purchases** for native payment flow

## Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
src/
├── contexts/          # React contexts (theme, auth, workout)
├── navigation/        # Navigation setup
├── screens/          # All app screens
│   ├── onboarding/   # Onboarding flow with gamification
│   ├── workout/      # Workout input and history screens
│   └── profile/      # Settings, billing, profile
├── components/       # Reusable UI components
├── services/         # Database, AI parsing, and sync services
├── types/           # TypeScript type definitions
└── utils/           # Workout parser, formatters, etc.
```

## Screen Flow & Navigation

### 1. Onboarding Flow
- Welcome screen with value proposition
- Gamification setup (streak goals, challenges)
- Workout preference setup (paste existing routines, templates)
- Trial signup with urgency tactics ("Save 30% - 24hrs left")
- Integration with RevenueCat/Superwall for subscription

### 2. Main App Flow
- **Workouts Screen** (Apple Notes style)
  - List of workout sessions by date
  - Accordion groups by week/month
  - Swipe actions (duplicate, delete)
  - Top-right: Profile dropdown (settings, billing)
  - Top-left: Streak indicator + "New Workout" button

- **Active Workout Screen** (Chat interface)
  - Single input field at bottom (like iMessage)
  - Auto-parsing of natural language input
  - Structured exercise blocks above
  - Auto-save every change
  - Inactive session detection

- **Profile & Settings**
  - Subscription management
  - Theme toggle (dark/light)
  - Export options
  - Sharing settings

## Core Features & Concepts

### 🔑 Core Concept
Users log workouts in a single input field at the bottom of the screen (like a chat app).

**Natural Input Examples:**
- "3x10 bench press @60kg, felt easy"
- "Deadlift 100x5, 105x5, 110x5 RPE 8"
- "squat 100x5" or "100x5 squat"

**Structured Output:**
```
Bench Press
- 3×10 @ 60kg (note: felt easy)
```

### 📱 UI Requirements
- Mobile-first, clean, zero distractions
- Sticky input bar at bottom
- Past sets visible above as structured blocks
- Faint/greyed-out previous values for known exercises
- Optional streak bar at top (GitHub-style)
- Support light and dark mode
- Auto-parsing with workout paste support

### 🧠 AI Integration (Optional MVP)
- Modular design - start with regex parsing
- Upgrade to DeepSeek API or OpenAI later
- Features: format text, suggest progress, auto-tag, templates

### 🧩 Gamification (Minimal + Integrated)
- Ambient streak progress bar
- Consecutive workout day tracking
- Micro-challenges ("Do 6 pull-ups today")
- Subtle, native feel - no fake badges

### 🌍 Viral Growth Mechanics
- Shareable minimalist summary cards
- Streak/volume/PR sharing
- Invite system with trial extensions
- Unique referral links

### 🔄 Session Auto-Handling
- Inactivity detection (5min toast, 10min auto-save)
- No manual session end required
- Seamless background saving

## Key Components

- `WorkoutParser`: Natural language parsing of exercise inputs
- `DatabaseService`: SQLite operations for workout data
- `ThemeProvider`: Light/dark theme management
- `WorkoutsScreen`: Main workout list (Apple Notes style)
- `WorkoutInputScreen`: Chat-like input interface
- `StreakTracker`: Gamification and progress tracking

## Database Schema

- `workout_sessions`: Individual workout sessions with metadata
- `workout_sets`: Exercise sets within sessions
- `user_profile`: User data, preferences, and statistics
- `templates`: Reusable workout templates
- `streaks`: Gamification data and challenges

## Monetization Strategy

### Free Trial
- **14-day free trial** with full feature access
- Urgency tactics during onboarding ("Save 30% - 24hrs left")
- Trial extensions via referral system

### Pro Subscription (€99/year)
- Unlimited AI parsing and suggestions
- Streak freezing capability
- Custom workout templates
- Advanced analytics and insights
- History export functionality
- Priority support

### Growth Mechanics
- **Viral sharing**: Minimalist workout summary cards
- **Referral system**: "Invite a friend, get +7 days Pro"
- **Social proof**: Streak sharing, PR celebrations

## Design Principles

### 🔥 Core Principles
- **Mobile-first, iOS native feel** - Optimize for iPhone 14/15
- **No unnecessary features** - Every element serves a purpose
- **Familiar interface** - Apple Notes/Notion-like familiarity
- **Simplicity is key** - Incredible design through minimalism
- **Emoji-friendly** - Natural integration (💪🦵🏽🏋️‍♂️)
- **Offline-first** - Fast local storage with optional cloud sync

### 🖌️ Design Requirements
- **Apple Notes-like UX** - Swipe to go back, fast input
- **Text-based input** - No sliders or toggles
- **Intuitive gestures** - Tap to edit, long-press to duplicate/delete
- **Dark mode by default** - Toggle in settings
- **iOS aesthetics** - Rounded corners, soft shadows, smooth transitions
- **Zero distractions** - Clean, minimal interface

### 🚫 AI Guardrails
- Limit input length for workout-related content only
- Nudge users if off-topic: "Keep it workout-related 💪"
- No general chat functionality - focus on workout logging

## Coding Style Guide

### General Principles
- **Follow existing patterns** - Mimic established code style
- **TypeScript everywhere** - Full type safety
- **Functional components** - Use React hooks, avoid class components
- **No comments** - Code should be self-documenting
- **Consistent naming** - camelCase for variables, PascalCase for components

### React Native Conventions
```typescript
// Component naming
const WorkoutInputScreen = () => {}

// File naming
WorkoutInputScreen.tsx
workoutParser.ts
types.ts

// Context naming
const ThemeContext = createContext<ThemeContextType>()
const useTheme = () => useContext(ThemeContext)
```

### Styling Conventions
```typescript
// Use StyleSheet.create for performance
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})

// Theme-aware styling
const getStyles = (theme: Theme) => StyleSheet.create({
  text: {
    color: theme.colors.text,
    fontSize: 16,
  },
})
```

### Database Conventions
```typescript
// Table naming: snake_case
workout_sessions
workout_sets
user_profile

// Column naming: snake_case
created_at
updated_at
session_id
exercise_name
```

### File Organization
- One component per file
- Co-locate related types
- Use barrel exports for clean imports
- Keep utility functions pure and testable

## Version Roadmap

### MVP (v1.0)
- ✅ Natural language workout input
- ✅ SQLite local storage
- ✅ Apple Notes-style UI
- ✅ Basic gamification (streaks)
- ✅ Dark/light mode

### v1.1 Features
- Workout templates
- Advanced AI parsing
- Social sharing
- Export functionality

### v1.5+ Stretch Goals
- Apple Health integration
- Wearable device sync (Whoop, Oura)
- Advanced analytics
- AI workout suggestions ("What did you do last chest day?")

