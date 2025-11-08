# Deployment Instructions

## Supabase Setup

1. Create new project at supabase.com
2. Run migration SQL in SQL Editor
3. Enable Google OAuth in Authentication settings
4. Copy URL and anon key to .env.local

## Vercel Deployment

```bash
npm run build
vercel --prod
```

- Add environment variables in Vercel dashboard
- Connect to GitHub repo for auto-deployments

## Testing Checklist

Before demo:

- [ ] User can sign up with Google OAuth
- [ ] User can complete onboarding flow
- [ ] Student can read an article and click words
- [ ] Word popup shows correct definitions
- [ ] Words can be saved to word bank
- [ ] Progress dashboard shows accurate stats
- [ ] Teacher can create a class
- [ ] Student can join class with code
- [ ] Teacher can view student progress
- [ ] Furigana displays correctly for Japanese
- [ ] Article recommendations work based on interests
- [ ] CSV export works for teacher

## Notes

- Content will be added manually - User will generate 40-60 articles using Claude Pro and insert via Supabase dashboard
- Word segmentation must be done during article creation - Pre-process all articles before inserting into database
- Start simple, iterate based on feedback from university testing
- Focus on core reading experience first - Other features can be simplified if time is tight
