import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOPIC_OPTIONS = [
  { label: 'Daily Life', icon: '🏠' },
  { label: 'Technology', icon: '💻' },
  { label: 'Culture & Travel', icon: '✈️' },
  { label: 'Food & Cooking', icon: '🍜' },
  { label: 'Entertainment & Hobbies', icon: '🎮' },
  { label: 'Business & Work', icon: '💼' },
  { label: 'Science & Nature', icon: '🔬' },
  { label: 'Sports & Fitness', icon: '⚽' },
  { label: 'Arts & Literature', icon: '🎨' },
  { label: 'Current Events', icon: '📰' },
];

interface InterestSurveyProps {
  onNext: (interests: string[]) => void;
}

export function InterestSurvey({ onNext }: InterestSurveyProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const handleTopicToggle = (topicLabel: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicLabel) ? prev.filter((t) => t !== topicLabel) : [...prev, topicLabel]
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
            <div key={topic.label} className="flex items-center space-x-2">
              <Checkbox
                id={topic.label}
                checked={selectedTopics.includes(topic.label)}
                onCheckedChange={() => handleTopicToggle(topic.label)}
              />
              <Label htmlFor={topic.label} className="cursor-pointer font-normal">
                <span className="inline-block mr-2 transition-transform hover:scale-125">{topic.icon}</span>
                {topic.label}
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

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onNext([])}
            className="flex-1"
          >
            Skip, I'll explore everything
          </Button>
          <Button onClick={handleNext} className="flex-1" disabled={selectedTopics.length === 0}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
