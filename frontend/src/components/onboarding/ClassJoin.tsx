import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClassJoinProps {
  onComplete: (joinCode?: string) => void;
  onBack: () => void;
}

export function ClassJoin({ onComplete, onBack }: ClassJoinProps) {
  const [joinCode, setJoinCode] = useState('');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="mb-2 text-sm text-muted-foreground">Step 3 of 3</div>
        <CardTitle>Join a class (optional)</CardTitle>
        <CardDescription>
          If your teacher gave you a class code, enter it below to join their class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="join-code">Class Code</Label>
          <Input
            id="join-code"
            placeholder="Enter class code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="font-mono uppercase"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button variant="outline" onClick={() => onComplete()} className="flex-1">
            Skip
          </Button>
          <Button
            onClick={() => onComplete(joinCode)}
            className="flex-1"
            disabled={!joinCode.trim()}
          >
            Join Class
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
