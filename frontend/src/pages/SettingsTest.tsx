import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function SettingsTest() {
  const { theme, setTheme } = useTheme();
  const [documentClasses, setDocumentClasses] = useState('');

  // Update document classes display when theme changes
  useEffect(() => {
    // Use a small delay to ensure the DOM has been updated
    const timer = setTimeout(() => {
      setDocumentClasses(document.documentElement.className);
    }, 0);
    return () => clearTimeout(timer);
  }, [theme]);

  // Debug logging
  console.log('Current theme:', theme, 'Type:', typeof theme);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Theme Settings Test</h1>

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
                console.log(`Theme option: ${themeOption.value}, Current theme: ${theme}, Selected: ${isSelected}, Types: theme=${typeof theme}, option=${typeof themeOption.value}`);
                return (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() => {
                    console.log(`Clicking theme: ${themeOption.value}`);
                    setTheme(themeOption.value);
                  }}
                  data-selected={isSelected}
                  data-theme-value={themeOption.value}
                  data-current-theme={theme}
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1">
              <div>Current Theme: {theme}</div>
              <div>Type: {typeof theme}</div>
              <div>Document Classes: {documentClasses}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
