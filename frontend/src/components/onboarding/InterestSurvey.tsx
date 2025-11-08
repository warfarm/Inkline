import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOPIC_OPTIONS = [
  'Daily Life',
  'Technology',
  'Culture & Travel',
  'Food & Cooking',
  'Entertainment & Hobbies',
  'Business & Work',
  'Science & Nature',
  'Sports & Fitness',
  'Arts & Literature',
  'Current Events',
];

interface InterestSurveyProps {
  onNext: (interests: string[]) => void;
}

export function InterestSurvey({ onNext }: InterestSurveyProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleNext = () => {
    const interests = [...selectedTopics];
    if (customInterest.trim()) {
      interests.push(customInterest.trim());
    }
    onNext(interests);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="mb-2 text-sm text-muted-foreground">Step 1 of 3</div>
        <CardTitle>What interests you?</CardTitle>
        <CardDescription>
          Select topics you'd like to read about. This helps us recommend articles for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {TOPIC_OPTIONS.map((topic) => (
            <div key={topic} className="flex items-center space-x-2">
              <Checkbox
                id={topic}
                checked={selectedTopics.includes(topic)}
                onCheckedChange={() => handleTopicToggle(topic)}
              />
              <Label htmlFor={topic} className="cursor-pointer font-normal">
                {topic}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-interest">Other interests (optional)</Label>
          <Input
            id="custom-interest"
            placeholder="e.g., History, Photography..."
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
          />
        </div>

        <Button onClick={handleNext} className="w-full" disabled={selectedTopics.length === 0}>
          Next
        </Button>
      </CardContent>
    </Card>
  );
}
