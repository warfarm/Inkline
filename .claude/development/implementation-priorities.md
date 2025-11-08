# Implementation Priorities

## Week 1: Setup & Core Infrastructure

- Initialize Vite + React + TypeScript project
- Set up Tailwind CSS and shadcn/ui
- Configure Supabase project:
  - Create database with schema
  - Enable Google OAuth
  - Set up RLS policies
- Build authentication flow:
  - Login page with Google OAuth
  - AuthContext and auth hooks
  - Protected routes
- Create basic layout and navigation

## Week 2: Reading Experience

- Build Article Reader component:
  - Render article content
  - Implement word segmentation display
  - Word click handler with popup
  - Phrase selection with popup
- Integrate dictionary APIs:
  - Jisho API for Japanese
  - CC-CEDICT for Chinese
- Build WordPopup and PhrasePopup components
- Implement "Save to Word Bank" functionality
- Track reading progress and save to database

## Week 3: Student Features

- Build onboarding flow:
  - Interest survey
  - Level selection
  - Class join (optional)
- Create student dashboard:
  - Progress metrics
  - Activity charts
  - Recent articles
- Build Word Bank page:
  - List view with filters
  - Status toggle
  - Basic flashcard practice
- Implement article discovery/browse page
- Add post-article feedback (More/Less topic)

## Week 4: Teacher Features & Polish

- Build teacher dashboard:
  - Class creation and management
  - Class overview metrics
  - Student list
- Create Student Detail View
- Implement CSV export
- Add struggling students alerts
- Japanese furigana logic:
  - Kanji familiarity tracking
  - Auto-hide after 3 encounters
  - User toggle
- Bug fixes and testing
- Deploy to Vercel
