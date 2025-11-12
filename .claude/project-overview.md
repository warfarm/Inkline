# Project Overview

## Language Learning Platform

Inkline is a web-based language learning platform focused on reading comprehension for English speakers learning Chinese (Simplified) and Japanese. The platform uses interactive articles with hover/click definitions, word banking with rich metadata, classroom management features, and comprehensive progress tracking.

**Tagline:** "To Learn or not to oshiemasu" (Japanese: to teach)

## Technical Stack

### Frontend

- **Framework:** React 19.1.1 + Vite 7.1.7 + TypeScript
- **UI Library:** shadcn/ui (with Radix UI primitives)
- **Styling:** Tailwind CSS 4.1.17
- **State Management:** React Context API + custom hooks
- **Routing:** React Router v7.9.5
- **HTTP Client:** Fetch API (built-in)
- **Notifications:** Sonner (toast notifications)

### Backend & Infrastructure

- **Backend:** Supabase (BaaS - Backend as a Service)
  - Authentication (Google OAuth)
  - PostgreSQL database with JSONB support
  - Row Level Security (RLS) for data isolation
  - Real-time database subscriptions
- **Deployment:** Vercel (frontend), Supabase Cloud (backend)
- **Environment:** Node.js 18+

### Language Processing & Dictionaries

- **Word Segmentation:**
  - Japanese: tiny-segmenter (JavaScript, lightweight, client-side)
  - Chinese: Jieba-inspired segmentation (custom implementation)
- **Dictionary APIs:**
  - Japanese: Jisho.org API (free, no auth required)
  - Chinese: CC-CEDICT data (60KB+ embedded dictionary, local lookups)
- **Character Breakdown:** Individual Chinese character definitions for compound words

### Key Features

- **Preloaded Definitions:** Articles cache dictionary definitions for instant lookup (no API delays)
- **Text-to-Speech:** Native browser Web Speech API for pronunciation
- **Character Breakdown:** Chinese compound words show individual character meanings
- **Theme System:** Dark/light mode with system preference detection
- **Settings Persistence:** User preferences saved to Supabase
- **Mobile Responsive:** Optimized for touch interactions and small screens

## Project Structure

```
Inkline/
├── frontend/
│   ├── src/
│   │   ├── components/          # 24+ React components organized by feature
│   │   │   ├── admin/          # PreloadDefinitions
│   │   │   ├── auth/           # LoginForm, AuthCallback, ProtectedRoute
│   │   │   ├── dashboard/      # StudentDashboard
│   │   │   ├── layout/         # Navigation, Layout wrapper
│   │   │   ├── onboarding/     # InterestSurvey, LevelSelection, JoinClass
│   │   │   ├── reading/        # ArticleReader, WordPopup, PhrasePopup, FuriganaText
│   │   │   ├── teacher/        # TeacherDashboard, ClassDetail, StudentDetail
│   │   │   ├── ui/             # shadcn/ui components (Button, Card, etc.)
│   │   │   └── wordbank/       # WordBankList, WordCard, FlashcardPractice
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx # Supabase auth state management
│   │   │   └── ThemeContext.tsx # Dark/light theme management
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useWordBankPanelPosition.ts
│   │   │   ├── useWordPopupMode.ts
│   │   │   ├── useKanjiFamiliarity.ts
│   │   │   └── useTheme.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts     # Supabase client initialization
│   │   │   ├── dictionaries/
│   │   │   │   ├── chinese.ts  # CC-CEDICT + character breakdown
│   │   │   │   └── jisho.ts    # Jisho.org API wrapper
│   │   │   ├── segmentation/
│   │   │   │   ├── japanese.ts # TinySegmenter wrapper
│   │   │   │   └── chinese.ts  # Jieba-inspired segmentation
│   │   │   └── utils.ts        # Utility functions
│   │   ├── pages/              # 14 page components (routes)
│   │   │   ├── Login.tsx
│   │   │   ├── AuthCallback.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── ArticleView.tsx
│   │   │   ├── WordBank.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── JoinClass.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── ClassDetail.tsx
│   │   │   └── ...
│   │   ├── scripts/            # Admin tools
│   │   │   ├── preloadArticleDefinitions.ts
│   │   │   └── resegmentArticles.ts
│   │   ├── types/
│   │   │   └── index.ts        # Shared TypeScript definitions
│   │   ├── App.tsx             # Main routing configuration
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global Tailwind CSS
│   ├── supabase/
│   │   ├── migrations/         # Historical database migrations (4 files)
│   │   ├── complete_setup.sql  # 🎯 Single-file complete schema (USE THIS)
│   │   └── seed.sql            # Sample data (optional)
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vercel.json             # Vercel deployment config
├── .claude/                    # Documentation for AI assistants
│   ├── project-overview.md     # This file
│   ├── config.md               # Development protocols
│   ├── database/
│   │   └── schema.md           # Database documentation
│   ├── design/
│   │   └── ui-ux-guidelines.md # Design system
│   ├── development/            # Development guides
│   └── features/               # Feature specifications (8 files)
├── backend/                    # Minimal (uses Supabase BaaS)
│   └── README.md
├── README.md                   # Project readme
├── DATABASE_UPDATE.md          # Migration instructions (historical)
├── PRELOAD_DEFINITIONS_GUIDE.md # Dictionary preloading guide
└── analyze_chinese.py          # Chinese article analysis tool

```

## Architecture Highlights

### 1. Modular Component Structure
Components organized by feature area (auth, reading, wordbank, teacher, etc.) with clear separation of concerns.

### 2. Type-Safe Development
Full TypeScript coverage with shared type definitions in `src/types/index.ts`. All API responses and component props are strongly typed.

### 3. Context-Based State Management
- **AuthContext:** Manages Supabase authentication state, user profile, session handling
- **ThemeContext:** Manages dark/light mode with localStorage persistence

### 4. Custom React Hooks
Reusable logic abstracted into hooks:
- `useAuth`: Authentication state and helpers
- `useTheme`: Theme toggling and system preference detection
- `useWordPopupMode`: User preference for hover vs. click
- `useKanjiFamiliarity`: Auto-hide furigana based on user familiarity
- `useWordBankPanelPosition`: Side panel positioning preference

### 5. Preloaded Data Strategy
Articles store cached dictionary definitions in `word_definitions` JSONB column. This eliminates API lookup delays during reading, providing instant word definitions.

**How it works:**
1. Admin navigates to `/admin` and clicks "Preload All Articles"
2. System fetches definitions for all words in all articles
3. Definitions stored in `articles.word_definitions` as JSON
4. ArticleReader checks cached definitions first, falls back to API if missing

### 6. Multi-Language Support
Separate segmentation engines and dictionary integrations for Chinese and Japanese. Language detection based on user profile and character analysis.

### 7. Role-Based Access Control (RBAC)
- **Student:** Access to articles, word bank, progress, class enrollment
- **Teacher:** Additional access to classroom management, student progress tracking

Enforced via:
- Supabase Row Level Security (RLS) policies
- React Router protected routes
- UI conditional rendering based on role

### 8. Progressive Enhancement
- Fallback from preloaded definitions to real-time API calls
- Graceful degradation when TTS unavailable
- Mobile-first responsive design

### 9. Performance Optimizations
- Vite for fast builds and hot module replacement
- Database indexes on common query patterns
- JSONB for flexible schema and fast queries
- React Router code splitting (lazy loading)

## Development Workflow

### Initial Setup

```bash
# Clone repository
cd Inkline/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run database setup (in Supabase SQL Editor)
# Copy contents of frontend/supabase/complete_setup.sql

# Start dev server
npm run dev
```

### Building for Production

```bash
# TypeScript check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview

# Deploy (automatic via Vercel on git push)
git push origin main
```

## Key Innovations

### 1. Character Breakdown for Chinese
When users click multi-character Chinese words, the popup shows individual character breakdowns with readings and definitions. This helps learners understand word composition.

Example: 学习 (xuéxí - to study)
- 学 (xué) - to learn
- 习 (xí) - to practice

### 2. Adaptive Furigana System (Japanese)
Tracks user familiarity with individual kanji characters. Automatically hides furigana readings once the user demonstrates knowledge, promoting character recognition.

### 3. Rich Dictionary Metadata
Word bank entries include:
- Grammar notes (for particles, function words)
- Formality levels (casual/polite/formal)
- Usage context and tips
- Multiple definitions with parts of speech
- User personal notes and mnemonics

### 4. Teacher Analytics
Teachers can view:
- Student reading history
- Words saved per article
- Time spent per article
- Class-wide progress metrics

### 5. Flashcard Customization
Students can create custom practice sets with configurable:
- Number of cards per session
- Card shuffle on/off
- Auto-advance timing
- Review tracking

## Security & Privacy

### Authentication
- Google OAuth via Supabase Auth
- Session management with JWT tokens
- Automatic token refresh

### Data Isolation
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Teachers can only see their own students
- No cross-user data leakage

### Data Ownership
- Students own their word banks, progress, and notes
- Teachers own their classes and can remove students
- No data selling or third-party sharing

## Deployment

### Frontend (Vercel)
- Automatic deployments on git push to main
- Edge network for fast global access
- Environment variables configured in Vercel dashboard

### Backend (Supabase Cloud)
- Managed PostgreSQL database
- Automatic backups
- Global CDN for assets
- Real-time subscriptions via WebSockets

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Future Enhancements

- [ ] Spaced repetition algorithm (SM-2 or similar)
- [ ] Audio article readings
- [ ] Community-contributed articles
- [ ] Export word bank to Anki format
- [ ] Gamification (streaks, achievements, leaderboards)
- [ ] AI-generated articles based on user level
- [ ] Voice recognition for pronunciation practice
- [ ] Korean language support
- [ ] Mobile native apps (React Native)

## Contributing

This project follows React and TypeScript best practices. When contributing:
1. Match existing code style and patterns
2. Add TypeScript types for all new code
3. Test responsive design on mobile
4. Update documentation for new features
5. Follow component organization conventions
6. Use existing UI components from shadcn/ui

## License

[Add license information]

## Contact

[Add contact information]
