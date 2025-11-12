import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function Navigation() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!profile) return null;

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut();
      // Always navigate to login, signOut handles errors internally
      navigate('/login');
    } catch (error) {
      // This should rarely happen now, but handle it gracefully
      console.error('Error signing out:', error);
      // Still navigate to login even if there's an error
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    Modules
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate('/articles')}>
                    Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/reading')}>
                    Reading
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" onClick={() => navigate('/word-bank')}>
                Word Bank
              </Button>
              <Button variant="ghost" onClick={() => navigate('/progress')}>
                Progress
              </Button>
              <Button variant="ghost" onClick={() => navigate('/my-classes')}>
                My Classes
              </Button>
              <Button variant="ghost" onClick={() => navigate('/settings')}>
                Settings
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </nav>
      </div>
    </header>
  );
}
