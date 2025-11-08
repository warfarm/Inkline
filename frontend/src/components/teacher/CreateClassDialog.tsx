import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface CreateClassDialogProps {
  onClassCreated: () => void;
}

export function CreateClassDialog({ onClassCreated }: CreateClassDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!user || !className.trim()) return;

    setLoading(true);
    setError('');

    try {
      const joinCode = generateJoinCode();

      const { error: insertError } = await supabase.from('classes').insert({
        teacher_id: user.id,
        name: className.trim(),
        join_code: joinCode,
      });

      if (insertError) throw insertError;

      setClassName('');
      setOpen(false);
      onClassCreated();
    } catch (err: any) {
      console.error('Error creating class:', err);
      setError(err.message || 'Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Class</Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Create a New Class</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a class and get a join code for your students
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="class-name" className="text-gray-900">Class Name</Label>
            <Input
              id="class-name"
              placeholder="e.g., Japanese 101, Chinese Intermediate"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && className.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <Button onClick={handleCreate} disabled={!className.trim() || loading} className="w-full">
          {loading ? 'Creating...' : 'Create Class'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
