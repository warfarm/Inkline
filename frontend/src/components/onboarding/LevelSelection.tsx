import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'I know basic phrases and can read simple sentences (~100-500 words)',
    sampleZh: '我喜欢学习中文。',
    sampleJa: '私は日本語を勉強します。',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'I can read short articles with some help',
    sampleZh: '今天天气很好，我想去公园散步。',
    sampleJa: '今日はいい天気なので、公園を散歩したいです。',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: "I'm comfortable reading most content with occasional lookups",
    sampleZh: '随着科技的发展，人工智能正在改变我们的生活方式。',
    sampleJa: '技術の進歩により、人工知能が私たちの生活様式を変えています。',
  },
] as const;

const LANGUAGES = [
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
] as const;

interface LevelSelectionProps {
  onNext: (level: string, language: string) => void;
  onBack: () => void;
}

export function LevelSelection({ onNext, onBack }: LevelSelectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleLanguageSelect = (value: string) => {
    console.log('Language selected:', value);
    setSelectedLanguage(value);
  };

  const handleLevelSelect = (value: string) => {
    console.log('Level selected:', value);
    setSelectedLevel(value);
  };

  const handleNext = () => {
    if (selectedLevel && selectedLanguage) {
      onNext(selectedLevel, selectedLanguage);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="mb-2 text-sm text-muted-foreground">Step 2 of 3</div>
        <CardTitle>Choose your language and level</CardTitle>
        <CardDescription>
          We'll recommend articles that match your skill level. You can change this anytime in settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">Target Language</Label>
          <div className="grid gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleLanguageSelect(lang.value);
                }}
                className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                  selectedLanguage === lang.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{lang.label}</div>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedLanguage === lang.value
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {selectedLanguage === lang.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Current Level</Label>
          <div className="grid gap-3">
            {LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleLevelSelect(level.value);
                }}
                className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                  selectedLevel === level.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-muted-foreground">{level.description}</div>
                  {selectedLanguage && (
                    <div className="mt-2 text-sm italic text-gray-600">
                      Example: {selectedLanguage === 'zh' ? level.sampleZh : level.sampleJa}
                    </div>
                  )}
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedLevel === level.value
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {selectedLevel === level.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={!selectedLevel || !selectedLanguage}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
