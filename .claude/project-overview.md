# Project Overview

## Language Learning Platform MVP

Build a web-based language learning platform focused on reading comprehension for English speakers learning Chinese (Simplified) and Japanese. The platform uses interactive articles with hover definitions, word banking, and teacher classroom management features.

## Technical Stack

### Frontend

- Framework: React 18 + Vite + TypeScript
- UI Library: shadcn/ui (with Radix UI primitives)
- Styling: Tailwind CSS
- State Management: React Context API + hooks
- Routing: React Router v6
- HTTP Client: Fetch API (built-in)

### Backend & Infrastructure

- Backend: Supabase
  - Authentication (Google OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
- Deployment: Vercel
- Environment: Node.js 18+

### Key Libraries

- **Word Segmentation:**
  - Japanese: tiny-segmenter (JavaScript, lightweight)
  - Chinese: nodejieba (or client-side alternative if needed)
- **Japanese Furigana:** kuroshiro + kuroshiro-analyzer-kuromoji
- **Dictionary APIs:**
  - Japanese: Jisho.org API (free, no key)
  - Chinese: CC-CEDICT data (parsed locally or use wrapper)

## Project Structure

```
language-learning-mvp/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── onboarding/
│   │   │   ├── InterestSurvey.tsx
│   │   │   └── LevelSelection.tsx
│   │   ├── reading/
│   │   │   ├── ArticleReader.tsx
│   │   │   ├── WordPopup.tsx
│   │   │   ├── PhrasePopup.tsx
│   │   │   └── FuriganaText.tsx
│   │   ├── wordbank/
│   │   │   ├── WordBankList.tsx
│   │   │   └── WordCard.tsx
│   │   ├── dashboard/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   └── ArticleGrid.tsx
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── ClassOverview.tsx
│   │   │   ├── StudentList.tsx
│   │   │   └── StudentDetailView.tsx
│   │   └── layout/
│   │       ├── Navigation.tsx
│   │       └── Layout.tsx
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── auth.ts           # Auth helpers
│   │   ├── dictionaries/
│   │   │   ├── jisho.ts      # Jisho API integration
│   │   │   └── cedict.ts     # CC-CEDICT integration
│   │   ├── segmentation/
│   │   │   ├── japanese.ts   # TinySegmenter wrapper
│   │   │   └── chinese.ts    # Jieba wrapper
│   │   └── utils.ts          # Utility functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useArticles.ts
│   │   ├── useWordBank.ts
│   │   └── useProgress.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Home.tsx
│   │   ├── ArticleView.tsx
│   │   ├── WordBank.tsx
│   │   ├── Progress.tsx
│   │   └── TeacherDashboard.tsx
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql              # Sample data (will be added manually)
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Your Task

Build this MVP following the specifications in the documentation. Prioritize the implementation schedule, start with Week 1 tasks, and ensure all core features are functional before the university demo. Ask clarifying questions if any requirements are ambiguous.

Use shadcn/ui components extensively for consistent, accessible UI. Follow React and TypeScript best practices. Implement proper error handling and loading states throughout.

**User Experience is VERY IMPORTANT** - Make sure to have responsive UI design!
