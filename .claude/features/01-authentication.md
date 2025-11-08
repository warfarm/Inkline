# Authentication & User Roles

## Requirements

- Google OAuth via Supabase Auth
- Two roles: `student` and `teacher`
- Role selection during signup
- Protected routes based on role

## Implementation

- Use Supabase `auth.signInWithOAuth({ provider: 'google' })`
- After first login, show role selection modal
- Store role in `profiles` table
- Create `AuthContext` to manage auth state globally
- Create `ProtectedRoute` component that checks auth + role
