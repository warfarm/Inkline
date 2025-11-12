# Settings & User Preferences

## Overview

The Settings page allows users to customize their learning experience with preferences for reading interactions, UI display, themes, and account management. All settings are persisted to the database and synced across devices.

## Settings Categories

### A. Reading Preferences

**1. Word Popup Mode**
- **Options:** Hover | Click
- **Default:** Click (mobile-friendly)
- **Description:**
  - **Hover:** Definitions appear when mouse hovers over word (desktop)
  - **Click:** Definitions appear on click/tap (works on all devices)
- **Storage:** Supabase database (future) or localStorage (current)
- **Hook:** `useWordPopupMode()`

**Use cases:**
- Desktop users prefer hover for faster reading
- Mobile users need click mode (no mouse)
- Touch screen laptops benefit from click mode

**2. Word Bank Panel Position**
- **Options:** Right Side | Left Side
- **Default:** Right Side
- **Description:** Position of the collapsible word bank panel during reading
- **Storage:** localStorage
- **Hook:** `useWordBankPanelPosition()`

**Benefits:**
- Left-handed users prefer left panel
- Multi-monitor setups
- Personal preference for reading flow

**3. Always Show Furigana** (Japanese only)
- **Options:** On | Off
- **Default:** Off (adaptive system)
- **Description:**
  - **Off:** Furigana auto-hides based on kanji familiarity
  - **On:** Always show readings above all kanji
- **Storage:** Supabase database
- **System:** Overrides `kanji_familiarity` table

**Use cases:**
- Beginners want all readings visible
- Advanced learners prefer adaptive system
- Temporary override for difficult texts

### B. Display Preferences

**1. Theme**
- **Options:** Light | Dark | System
- **Default:** System (matches OS preference)
- **Description:** Color theme for entire application
- **Storage:** localStorage
- **Context:** `ThemeContext.tsx`
- **Hook:** `useTheme()`

**Theme features:**
- Smooth transitions between themes
- Affects all components (articles, popups, word bank)
- High contrast for readability
- Reduced eye strain in dark mode

**2. Font Size** (future)
- **Options:** Small | Medium | Large | Extra Large
- **Default:** Medium
- **Description:** Base font size for article text
- **Range:** 14px - 24px

**3. Line Spacing** (future)
- **Options:** Compact | Normal | Relaxed
- **Default:** Normal
- **Description:** Line height for article text

### C. Learning Preferences

**1. Target Language**
- **Options:** Chinese (Simplified) | Japanese
- **Default:** Set during onboarding
- **Description:** Primary language being learned
- **Storage:** `profiles.target_language`
- **Impact:**
  - Article filtering
  - Dictionary selection
  - Text-to-speech voice
  - UI language hints

**Cannot be changed** after initial setup (would require word bank migration).

**2. Difficulty Level**
- **Options:** Beginner | Intermediate | Advanced
- **Default:** Set during onboarding
- **Description:** Current proficiency level
- **Storage:** `profiles.current_level`
- **Impact:**
  - Article recommendations
  - Default article filter
  - Suggested grammar points

**Can be updated** as user progresses.

**3. Interests**
- **Options:** Technology, Culture, Food, Travel, Business, etc.
- **Default:** Selected during onboarding
- **Description:** Topic preferences for article recommendations
- **Storage:** `profiles.interests` (JSONB array)
- **Impact:**
  - Home page article sorting
  - "More like this" recommendations
  - Email digest content (future)

### D. Flashcard Preferences

**1. Cards Per Session**
- **Options:** 10 | 20 | 50 | All
- **Default:** 20
- **Description:** Number of flashcards per practice session
- **Storage:** localStorage

**2. Shuffle Cards**
- **Options:** On | Off
- **Default:** On
- **Description:** Randomize card order
- **Storage:** localStorage

**3. Auto-Advance**
- **Options:** Off | 3 seconds | 5 seconds | 10 seconds
- **Default:** Off
- **Description:** Automatically advance to next card after reveal
- **Storage:** localStorage

**4. Show Reading**
- **Options:** Always | On Reveal | Never
- **Default:** On Reveal
- **Description:** When to show pronunciation (Pinyin/Hiragana)
- **Storage:** localStorage

### E. Notification Preferences (future)

**1. Email Notifications**
- New articles added
- Weekly progress summary
- Flashcard review reminders
- Class announcements (teachers)

**2. Push Notifications**
- Daily review reminder
- Streak maintenance
- Achievement unlocks

**3. In-App Toasts**
- Word saved confirmations
- Progress milestones
- Error messages

### F. Privacy & Security

**1. Account Information**
- **Display Name:** Editable
- **Email:** Read-only (from Google OAuth)
- **Role:** Student or Teacher (read-only)
- **Account Created:** Timestamp

**2. Data Management**
- **Export Data:** Download all user data (GDPR compliance)
  - Word bank
  - Reading history
  - Progress stats
  - User notes
- **Delete Account:** Permanent deletion with confirmation
  - Removes all user data
  - Cannot be undone
  - Email confirmation required

**3. Privacy Settings** (future)
- Profile visibility (public/private)
- Allow teachers to view progress
- Share progress with classmates

## UI Layout

```
┌─────────────────────────────────────────┐
│ Settings                      [× Close] │
├─────────────────────────────────────────┤
│                                         │
│ 📖 Reading Preferences                  │
│   • Word Popup Mode        [Click ▼]   │
│   • Panel Position         [Right ▼]   │
│   • Always Show Furigana   [Off ▼]     │
│                                         │
│ 🎨 Display                              │
│   • Theme                  [Dark ▼]    │
│   • Font Size              [Medium ▼]  │
│                                         │
│ 🎓 Learning                             │
│   • Difficulty Level    [Intermediate] │
│   • Interests              [Edit...]   │
│                                         │
│ 📇 Flashcards                           │
│   • Cards Per Session      [20 ▼]     │
│   • Shuffle Cards          [✓ On]     │
│   • Auto-Advance           [Off ▼]    │
│                                         │
│ 👤 Account                              │
│   • Display Name           [Edit]      │
│   • Email       user@example.com       │
│   • Export Data           [Download]   │
│   • Delete Account        [Delete]     │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation

### ThemeContext

Manages theme state and persistence.

```typescript
// frontend/src/contexts/ThemeContext.tsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    const effectiveTheme = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);

    // Persist to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Custom Hooks

**useTheme()**
```typescript
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**useWordPopupMode()**
```typescript
export const useWordPopupMode = () => {
  const [mode, setMode] = useState<'hover' | 'click'>(
    () => localStorage.getItem('wordPopupMode') as 'hover' | 'click' || 'click'
  );

  const updateMode = (newMode: 'hover' | 'click') => {
    setMode(newMode);
    localStorage.setItem('wordPopupMode', newMode);
  };

  return { mode, setMode: updateMode };
};
```

**useWordBankPanelPosition()**
```typescript
export const useWordBankPanelPosition = () => {
  const [position, setPosition] = useState<'left' | 'right'>(
    () => localStorage.getItem('wordBankPanelPosition') as 'left' | 'right' || 'right'
  );

  const updatePosition = (newPosition: 'left' | 'right') => {
    setPosition(newPosition);
    localStorage.setItem('wordBankPanelPosition', newPosition);
  };

  return { position, setPosition: updatePosition };
};
```

### Database Updates

**Update user profile:**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    display_name: newDisplayName,
    current_level: newLevel,
    interests: newInterests,
  })
  .eq('id', user.id);
```

## Storage Strategy

### localStorage
**Used for:**
- UI preferences (theme, font size)
- Reading preferences (popup mode, panel position)
- Flashcard settings
- Non-critical settings

**Benefits:**
- Instant access (no network)
- No database load
- Simple API

**Drawbacks:**
- Not synced across devices
- Can be cleared by user

### Supabase Database
**Used for:**
- User profile data
- Learning preferences
- Account settings
- Critical preferences

**Benefits:**
- Synced across devices
- Backed up
- Secure (RLS policies)

**Drawbacks:**
- Requires network
- Slightly slower access

### Hybrid Approach
1. Read from localStorage first (fast)
2. Fetch from database on mount (sync)
3. Write to both on update (reliability)

## Settings Page Route

```typescript
// frontend/src/pages/Settings.tsx
export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = useWordPopupMode();
  const { position, setPosition } = useWordBankPanelPosition();
  const { user, profile } = useAuth();

  const handleSave = async () => {
    // Save to database
    await supabase.from('profiles').update({...}).eq('id', user.id);
    // Show toast
    toast.success('Settings saved!');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      {/* Reading Preferences */}
      {/* Display Preferences */}
      {/* Learning Preferences */}
      {/* Account Management */}
    </div>
  );
};
```

## Validation

**Display Name:**
- Min length: 2 characters
- Max length: 50 characters
- No special characters (only letters, numbers, spaces, hyphens)

**Interests:**
- Min: 1 interest
- Max: 10 interests
- Predefined list (no custom entries)

**Flashcard Settings:**
- Cards per session: 1-1000
- Auto-advance: 0-60 seconds

## Default Values

**First-time users:**
- Theme: System
- Word Popup Mode: Click
- Panel Position: Right
- Always Show Furigana: Off
- Cards Per Session: 20
- Shuffle: On
- Auto-Advance: Off

**Set during onboarding:**
- Target Language
- Difficulty Level
- Interests

## Mobile Optimization

**Responsive design:**
- Full-width sections on mobile
- Bottom sheet for modals
- Touch-friendly dropdowns
- Swipe to go back

**Optimizations:**
- Lazy load settings sections
- Debounced auto-save (1 second)
- Optimistic UI updates

## Accessibility

- **Keyboard navigation:** Tab through settings, Enter to select
- **Screen readers:** Proper labels and descriptions
- **High contrast:** Theme-aware colors
- **Focus indicators:** Clear visual feedback

## Related Files

**Pages:**
- `frontend/src/pages/Settings.tsx` - Settings page

**Contexts:**
- `frontend/src/contexts/ThemeContext.tsx` - Theme management
- `frontend/src/contexts/AuthContext.tsx` - User profile access

**Hooks:**
- `frontend/src/hooks/useTheme.ts` - Theme state
- `frontend/src/hooks/useWordPopupMode.ts` - Popup mode preference
- `frontend/src/hooks/useWordBankPanelPosition.ts` - Panel position
- `frontend/src/hooks/useAuth.ts` - User profile

**Components:**
- `frontend/src/components/ui/Select.tsx` - Dropdown selects (shadcn/ui)
- `frontend/src/components/ui/Switch.tsx` - Toggle switches
- `frontend/src/components/ui/Button.tsx` - Action buttons

**Database:**
- `profiles` table - User profile and learning preferences

## Future Enhancements

- [ ] Language UI localization (Chinese/Japanese interface)
- [ ] Custom keyboard shortcuts
- [ ] Reading speed goals
- [ ] Daily word target
- [ ] Notification schedule
- [ ] Data export formats (CSV, JSON, Anki)
- [ ] Two-factor authentication
- [ ] Session management (active devices)
- [ ] Privacy controls
- [ ] Content filtering
- [ ] Accessibility settings (high contrast, dyslexia-friendly font)
- [ ] Audio settings (TTS voice, speed, pitch)
- [ ] Offline mode toggle
- [ ] Sync preferences across browsers
- [ ] Settings search bar
- [ ] Settings import/export
- [ ] Reset to defaults button
