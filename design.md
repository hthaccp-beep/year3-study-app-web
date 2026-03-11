# Year 3 Grammar School Prep App - Design Document

## Overview

A child-friendly mobile study planning and revision app designed for Year 3 pupils (Age 8) preparing for selective grammar schools (Tiffin, Slough, QE). The app emphasizes daily practice, progressive mastery, and confidence-building through a structured learning journey from beginner to expert level.

**Design Principles:**
- **Mobile Portrait (9:16)** – optimized for one-handed usage
- **Apple HIG Alignment** – feels like a first-party iOS app
- **Child-Friendly** – large touch targets, clear typography, encouraging language
- **Progressive Mastery** – starts with 5 questions per subject, increases by level
- **Daily Habit Building** – short, focused practice sessions

---

## Screen List

### 1. **Onboarding Screen**
- Welcome message introducing the app
- Parent/Guardian acknowledgment (simple checkbox)
- Quick setup: Select child's name and year group
- "Get Started" button to proceed to Home

### 2. **Home Screen (Dashboard)**
- Greeting: "Hello [Child's Name]! Ready to practice today?"
- **Today's Progress** card showing:
  - Subjects completed today (visual checkmarks)
  - Total time spent
  - Streak counter (days in a row practicing)
- **Quick Start Buttons** for each subject:
  - English
  - Maths
  - Science
  - Reasoning (optional, for selective prep)
- **Weekly Overview** – small bar chart showing practice days this week
- Tab bar at bottom: Home | Subjects | Progress | Settings

### 3. **Subject Selection Screen**
- Grid of subject cards (English, Maths, Science, Reasoning)
- Each card shows:
  - Subject icon
  - Current level (Beginner → Intermediate → Advanced → Expert)
  - Progress bar (% complete at current level)
  - "Start Practice" button
- "View All Stats" link to detailed progress page

### 4. **Practice Session Screen**
- Header showing:
  - Subject name
  - Current level (e.g., "Level 2: Intermediate")
  - Question counter (e.g., "Question 3 of 5")
- **Question Display Area:**
  - Clear, large text for the question
  - Appropriate input method (multiple choice, text input, drag-and-drop)
  - Encouraging feedback: "Great thinking!" or "Try again!"
- **Navigation:**
  - "Previous" button (if not first question)
  - "Next" or "Submit" button
  - Progress indicator at bottom (5 dots, filled as you progress)

### 5. **Answer Feedback Screen**
- Large checkmark or X icon
- Encouraging message:
  - ✓ "Excellent! Well done!" / "That's correct!"
  - ✗ "Not quite right. The answer is [X]. Try the next one!"
- Explanation of the concept (age-appropriate)
- "Next Question" button

### 6. **Session Complete Screen**
- Celebration animation (confetti, stars)
- Summary:
  - Questions answered: X/5
  - Accuracy: X%
  - Time taken: X minutes
  - Points earned: X
- **Level Up Notification** (if applicable):
  - "🎉 You've reached Level 3: Advanced!"
  - "You can now access harder questions"
- "Practice Another Subject" or "Return to Home" buttons

### 7. **Progress Screen**
- **Overall Stats:**
  - Total practice time this week
  - Streak counter
  - Total points earned
- **Subject Breakdown:**
  - Cards for each subject showing:
    - Current level
    - Progress to next level (%)
    - Questions answered this week
    - Accuracy rate
- **Weekly Calendar:**
  - Visual calendar showing days practiced (green checkmarks)
  - Motivational message for consistency

### 8. **Settings Screen**
- Child's name and year group (editable)
- Target school (optional, for motivation)
- Notification preferences (daily reminders)
- Theme: Light / Dark mode toggle
- About & Help
- Reset Progress (with confirmation)

---

## Primary Content and Functionality

### **Subjects & Exercise Structure**

| Subject | Topics | Question Types |
|---------|--------|-----------------|
| **English** | Phonics, Spelling, Grammar, Reading Comprehension | Multiple choice, Fill-in-the-blank, Matching |
| **Maths** | Number bonds, Addition/Subtraction, Multiplication/Division, Fractions, Measurement | Multiple choice, Numeric input, Visual (shapes) |
| **Science** | Life cycles, States of matter, Forces, Habitats, Human body | Multiple choice, Matching, Sorting |
| **Reasoning** | Logic puzzles, Pattern recognition, Analogies, Spatial reasoning | Multiple choice, Visual puzzles, Sequencing |

### **Level Progression System**

- **Beginner (Level 1):** 5 questions per session
- **Intermediate (Level 2):** 7 questions per session
- **Advanced (Level 3):** 10 questions per session
- **Expert (Level 4):** 12 questions per session + mixed difficulty

**Advancement Criteria:**
- Complete all questions in a level
- Achieve 80%+ accuracy across 3 consecutive sessions
- Unlock next level automatically

### **Gamification Elements**

- **Points System:** 10 points per correct answer, bonus for streaks
- **Streak Counter:** Days in a row practicing (visual badge)
- **Level Badges:** Visual badges for each level achieved
- **Weekly Challenges:** "Answer 20 questions this week" (optional)

---

## Key User Flows

### **Flow 1: Daily Practice Session**
1. User opens app → Home screen
2. Taps "Start Practice" on a subject card
3. Sees first question of the session
4. Answers question → receives instant feedback
5. Taps "Next" → proceeds to next question
6. After final question → Session Complete screen
7. Taps "Return to Home" → Home screen updates with new stats

### **Flow 2: Level Progression**
1. User completes session with 80%+ accuracy
2. System tracks accuracy across sessions
3. After 3rd consecutive session at 80%+, level unlocks
4. Next time user starts practice → "Level Up!" notification
5. Next session has more questions and slightly harder content

### **Flow 3: Weekly Progress Review**
1. User taps "Progress" tab
2. Views weekly stats and calendar
3. Sees which days they practiced
4. Taps on a specific day to see session details
5. Returns to Home or continues browsing

### **Flow 4: Parent/Guardian Setup**
1. First app launch → Onboarding screen
2. Parent/Guardian enters child's name and year group
3. Optionally sets target school
4. Enables/disables notifications
5. Taps "Get Started" → Home screen

---

## Color Choices

### **Brand Palette**

| Element | Color | Usage |
|---------|-------|-------|
| **Primary** | `#4F46E5` (Indigo) | Buttons, headers, active states |
| **Success** | `#10B981` (Emerald) | Correct answers, level-up badges |
| **Warning** | `#F59E0B` (Amber) | Incorrect answers, hints |
| **Background** | `#FFFFFF` (White) / `#F9FAFB` (Light Gray) | Screen backgrounds |
| **Surface** | `#F3F4F6` (Pale Gray) | Cards, containers |
| **Text Primary** | `#1F2937` (Dark Gray) | Main text |
| **Text Secondary** | `#6B7280` (Medium Gray) | Secondary text, labels |
| **Accent** | `#EC4899` (Pink) | Streak badges, achievements |
| **Neutral** | `#D1D5DB` (Light Gray) | Borders, dividers |

### **Dark Mode Palette**

| Element | Color | Usage |
|---------|-------|-------|
| **Background** | `#0F172A` (Dark Navy) | Screen backgrounds |
| **Surface** | `#1E293B` (Dark Slate) | Cards, containers |
| **Text Primary** | `#F1F5F9` (Off-white) | Main text |
| **Text Secondary** | `#94A3B8` (Light Slate) | Secondary text |

---

## Typography

- **Headings:** SF Pro Display (iOS) / Roboto Bold (Android), 24-32px
- **Body Text:** SF Pro Text (iOS) / Roboto Regular (Android), 16-18px
- **Small Text:** SF Pro Text (iOS) / Roboto Regular (Android), 12-14px
- **Line Height:** 1.5× for readability (child-friendly)

---

## Interaction Design

### **Touch Targets**
- Minimum 44×44pt (Apple HIG standard)
- Buttons: 48×48pt for primary actions
- Spacing: 16pt between interactive elements

### **Feedback**
- Instant visual feedback on button press (scale 0.97)
- Haptic feedback on correct/incorrect answers (light impact)
- Animations: Subtle fade-in for questions, celebration animation on level-up

### **Accessibility**
- High contrast ratios (WCAG AA minimum)
- Large, clear fonts
- Color not the only indicator (use icons + text)
- Simple, predictable navigation

---

## Navigation Structure

```
Home (Dashboard)
├── Quick Start (Subject Practice)
│   └── Practice Session
│       └── Session Complete
├── Subjects (Subject Selection)
│   └── Practice Session
│       └── Session Complete
├── Progress (Weekly Stats)
│   └── Session Details
└── Settings
    └── Edit Profile / Preferences
```

---

## Success Metrics

- Daily active usage (target: 5-10 min/day)
- Completion rate (% of sessions completed)
- Level progression (average time to reach Expert)
- Accuracy improvement over time
- Parent satisfaction (optional feedback)

