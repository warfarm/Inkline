import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate(profile.role === 'teacher' ? '/teacher' : '/home')}>
          Inkline
        </h1>
        <nav className="flex items-center gap-4">
          {profile.role === 'student' ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/home')}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/word-bank')}>
                Word Bank
              </Button>
              <Button variant="ghost" onClick={() => navigate('/progress')}>
                Progress
              </Button>
              <Button variant="ghost" onClick={() => navigate('/my-classes')}>
                My Classes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/teacher')}>
                Classes
              </Button>
            </>
          )}
          <span className="text-sm text-muted-foreground">{profile.display_name}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
}
