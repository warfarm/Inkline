import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWordPopupMode } from '@/hooks/useWordPopupMode';
import { useWordBankPanelPosition } from '@/hooks/useWordBankPanelPosition';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'I know basic phrases and can read simple sentences',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'I can read short articles with some help',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: "I'm comfortable reading most content with occasional lookups",
  },
] as const;

const LANGUAGES = [
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
] as const;

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

const THEMES: Array<{
  value: 'light' | 'dark' | 'sepia' | 'night';
  label: string;
  description: string;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean and bright theme (default)',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes in low light',
  },
  {
    value: 'sepia',
    label: 'Sepia',
    description: 'Warm tones for comfortable reading',
  },
  {
    value: 'night',
    label: 'Night',
    description: 'Deep dark theme for nighttime use',
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { mode: popupMode, setMode: setPopupMode } = useWordPopupMode();
  const { position: panelPosition, setPosition: setPanelPosition } = useWordBankPanelPosition();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedLevel(profile.current_level || '');
      setSelectedLanguage(profile.target_language || '');
      setSelectedTopics(profile.interests || []);
    }
  }, [profile]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const interests = [...selectedTopics];
      if (customInterest.trim()) {
        interests.push(customInterest.trim());
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          current_level: selectedLevel,
          target_language: selectedLanguage,
          interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();

      toast.success('Settings updated', {
        description: 'Your preferences have been saved successfully.',
      });
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to update settings', {
        description: 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto max-w-4xl flex items-center justify-between px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            ← Back
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl py-8 px-4">

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose your preferred color theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label className="text-base font-semibold">Theme</Label>
            <div className="grid gap-3">
              {THEMES.map((themeOption) => {
                const isSelected = theme === themeOption.value;
                return (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() => setTheme(themeOption.value)}
                  className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-sm text-muted-foreground">{themeOption.description}</div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="h-3 w-3 rounded-full bg-primary"
                        style={{ backgroundColor: 'hsl(var(--primary))' }}
                      />
                    )}
                  </div>
                </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language & Level</CardTitle>
            <CardDescription>
              Change your target language and current skill level
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
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                      selectedLanguage === lang.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{lang.label}</div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedLanguage === lang.value
                          ? 'border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedLanguage === lang.value && (
                        <div className="h-3 w-3 rounded-full bg-primary" />
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
                    onClick={() => setSelectedLevel(level.value)}
                    className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                      selectedLevel === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selectedLevel === level.value
                          ? 'border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {selectedLevel === level.value && (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>
              Select topics you're interested in to get better article recommendations
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading Preferences</CardTitle>
            <CardDescription>
              Customize how you interact with words while reading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Word Definition Display</Label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setPopupMode('hover')}
                  className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                    popupMode === 'hover'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">Hover (Default)</div>
                    <div className="text-sm text-muted-foreground">
                      Definitions appear when you hover over words
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      popupMode === 'hover'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {popupMode === 'hover' && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPopupMode('click')}
                  className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                    popupMode === 'click'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">Click</div>
                    <div className="text-sm text-muted-foreground">
                      Definitions appear when you click on words
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      popupMode === 'click'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {popupMode === 'click' && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <Label className="text-base font-semibold">Word Bank Panel Position</Label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setPanelPosition('right')}
                  className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                    panelPosition === 'right'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">Right Side (Default)</div>
                    <div className="text-sm text-muted-foreground">
                      Word bank appears on the right side of the screen
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      panelPosition === 'right'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {panelPosition === 'right' && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPanelPosition('left')}
                  className={`flex items-center rounded-lg border-2 p-4 text-left transition-colors cursor-pointer ${
                    panelPosition === 'left'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">Left Side</div>
                    <div className="text-sm text-muted-foreground">
                      Word bank appears on the left side of the screen
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      panelPosition === 'left'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {panelPosition === 'left' && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/home')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
