# Code Style & Best Practices

## TypeScript

- Use strict mode
- Define interfaces for all data models
- Use proper typing, avoid `any`

## React

- Functional components with hooks
- Custom hooks for data fetching and state logic
- Use React Context for global state (auth, user settings)
- Proper error boundaries

## Styling

- Use Tailwind utility classes
- Follow shadcn/ui component patterns
- Maintain consistent spacing and typography

## Supabase

- Use RLS policies for all data access
- Never expose service role key in client
- Handle auth state changes properly
- Use Supabase realtime for teacher dashboard

## Performance

- Lazy load routes with React.lazy()
- Memoize expensive computations
- Optimize article rendering for long texts
- Use proper indexes in database queries

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
