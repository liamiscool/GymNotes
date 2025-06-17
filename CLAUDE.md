# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymNotes is an iOS-first gym workout tracking app built with React Native (Expo). The app feels like Apple Notes but for workouts - extremely fast, beautiful, and distraction-free.

## Tech Stack

- **Frontend**: React Native with Expo SDK 53
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Database**: SQLite (expo-sqlite) for local storage
- **Styling**: React Native StyleSheet with custom theming
- **State Management**: React Context (Theme, potentially more)
- **TypeScript**: Full TypeScript support

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
├── contexts/          # React contexts (theme, etc.)
├── navigation/        # Navigation setup
├── screens/          # All app screens
│   ├── onboarding/   # Onboarding flow
│   └── workout/      # Workout-related screens
├── components/       # Reusable UI components
├── services/         # Database and API services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (workout parser, etc.)
```

## Core Features

1. **Chat-like Workout Input**: Users type exercises in natural language (e.g., "3x10 bench press @60kg")
2. **Smart Parsing**: Automatic parsing of workout inputs into structured data
3. **Apple Notes-style UI**: Clean, minimalist interface with iOS design patterns
4. **Offline-first**: All data stored locally in SQLite
5. **Dark/Light Mode**: Automatic theme switching based on system preferences

## Key Components

- `WorkoutParser`: Handles natural language parsing of exercise inputs
- `DatabaseService`: SQLite operations for workout data
- `ThemeProvider`: Manages light/dark theme switching
- `WorkoutsScreen`: Main list of workout sessions (Apple Notes style)
- `WorkoutInputScreen`: Chat-like input interface for logging exercises

## Database Schema

- `workout_sessions`: Individual workout sessions
- `workout_sets`: Exercise sets within sessions
- `user_profile`: User data and statistics

## App Requirements

🔥 Core Principles:
Mobile-first, iOS native feel

No unnecessary features

Looks like a notes app (or notion) - familiar is this way.
Simplicty is key. incredible design!

Light/dark mode support

Emoji-friendly (e.g. 💪🦵🏽🏋️‍♂️)

Offline-first, syncs to local DB or optional cloud

✅ Core Features (MVP):
Create workout note

Tap "New Workout" → opens blank screen like Notes

Free-form typing + smart formatting (e.g. Squat 3x5 100kg)

Auto-formatting / shortcuts

Recognizes patterns like 3x12, superset, Rest 60s

Turns headings bold (e.g. Upper Body, Leg Day)

Emojis inline for clarity and fun

History View

List of past workouts by date (simple scroll)

Tap to view/edit

Workout Templates (v1.1+)

Save a note as a reusable template

Sync (optional)

Local-first, then optional cloud sync (iCloud or Supabase)

Monetization

One-time payment or monthly sub for:

Templates

History export

Minimal analytics (volume over time)

🖌️ Design Requirements
Apple Notes-like UX (swipe to go back, fast input)

Text-based input, no sliders or toggles

Tap to edit, long-press to duplicate/delete

Dark mode by default, toggle in settings

Rounded corners, soft shadows, smooth transitions

📱 Platform
iOS-first priority: built in SwiftUI or React Native with a native feel

If cross-platform: use Flutter or Expo + React Native but optimize for iPhone 14/15 first

Android comes later — only if parity can be maintained without compromising design polish

🚀 Stretch (v1.5+)
AI suggestion prompt: “What did you do last chest day?”

Integrate with Apple Health to read HR, duration

Optional sync with Whoop or Oura for rest day suggestions




I’m building a mobile-first workout tracking app called GymNotes. The app should feel like a hybrid between a notes app (like Apple Notes or Notion) and a chat interface. It must prioritize simplicity, speed, and ease of input. Most workout apps are bloated and slow; GymNotes should be the opposite — as fast and frictionless as writing in a notes app, but purpose-built for gym logging.

This is a technical build prompt to help you implement the MVP. I’m working in Cursor and using a local dev setup, so make decisions accordingly.

🔑 Core Concept
Users log workouts in a single input field at the bottom of the screen (like a chat app).

The input can be natural:

e.g. “3x10 bench press @60kg, felt easy”

e.g. “Deadlift 100x5, 105x5, 110x5 RPE 8”

These inputs are parsed into structured entries visually formatted as:

css
Copy
Edit
Bench Press
- 3×10 @ 60kg (note: felt easy)
Each workout session = one long scrollable page.

Past logs are stored as entries and are easily accessible like Apple Notes.

App auto-saves, no need to close workouts manually.

📱 UI Requirements
Layout:
Mobile-first, clean, zero distractions.

Sticky input bar at the bottom.

Past sets visible above as structured blocks.

Show faint/greyed-out previous values when a known exercise is re-entered.

Optional streak bar at top (GitHub-style).

Support light and dark mode.

User Input UX:
Typing "3x5 squats @100kg" should auto-parse into structured format.

Typing just “squat 100x5” or “100x5 squat” should still work.

Support workout pasting from ChatGPT or web (auto parses).

Show recent entries/weights in-line or as suggestions.

🧠 AI (Optional in MVP)
Keep AI modular. Start with a basic parser (could use DeepSeek API or regex parsing). Allow plug-in upgrade later using OpenAI or fine-tuned models.

AI will:

Format text into structured logs.

Suggest progress: “Try +2.5kg next time.”

Auto-tag (e.g., #push, #legs).

Generate templates from pasted text.

🧩 Gamification (Minimal + Integrated)
Show ambient streak progress bar.

Track consecutive workout days.

Offer adaptive micro-challenges like “Do 6 pull-ups today”.

Don’t show fake badges or celebrations — keep it subtle, feel native to notes.

🌍 Viral Growth Mechanics
Shareable summaries:

Auto-generate minimalist PNG cards or text exports.

Include streaks, volume lifted, PRs.

Invite system:

“Invite a friend, get +7 days Pro.”

Use unique referral links.

🧱 Tech Stack + Build Specs
Frontend: React Native (or SwiftUI if iOS-only MVP).

Backend (MVP): Local SQLite DB.

Add Supabase later for auth/cloud sync.

AI APIs: Start with DeepSeek for parsing. Later OpenAI for summaries.

No external analytics. No ads.

Keep everything snappy and offline-first.

🛠 Monetization
Free 14-day trial

Pro (€99/year):

Unlimited AI

Streak freezing

Custom templates

Advanced analytics later

🔄 Session Auto-Handling
Detects inactivity: if no entry in 5 minutes, show toast: “Done for today?”

After 10 minutes of no typing, auto-saves and logs workout.

No need to manually end/submit a workout.

🚫 AI Guardrails
Don’t let users chat or ask off-topic stuff.

Limit input length or nudge them if off-topic:
“Keep it workout-related 💪”

✅ Priorities
Input parser that turns typed text into structured blocks.

Fast, smooth UI for logging and viewing history.

Streak bar and minimal gamification.

Viral sharing mechanics (summary card).

Optional AI parsing if simple regex fails.

a few things before we kick of coding - 

1. is expo + eract good ? it will have all functiaonity we need for this for iphone in particular (and work on andoird as well ye ? 
2. is sqlite is that for quick fast saving to the iphone ? andthen we'd save later to supabase? or do we just do that right away? or whats teh besy way that others doing this so its fast af!! like apple notes
3. the flow of screens is like this
- onboarding - we need th have the gamification elements in here and other tactics used like the sign up now to save % in the next 24 hours. we'll implment that with other softaare for pricing things - and the set of the users workouts. the copy and paste (whic then creates into the notes) or other means. start trial - this will likely be handled with Superwall or revnuecat
- main screen - Workouts this a list of all the days of workouts similar to apple notes main screen. tap a workout to start. you can accordion close that group of workouts. and keep scrolling down to see more workouts. top right button is dropdown to profile, settings billing so on, top left 