# UI/UX Best Practices for Language Learning Platform

## Core Principles for Reading-First Learning

The reading interface is the heart of this platform. Every design decision should optimize for comfortable, distraction-free reading while making interactions (word lookups, phrase highlighting) feel natural and unobtrusive. Users should be able to focus on content comprehension without fighting the interface.

## Reading Interface Design

### Typography & Readability

**Chinese/Japanese Text Rendering:**

- Use appropriate fonts: Noto Sans CJK, Source Han Sans, or system defaults (PingFang SC, Hiragino Sans)
- Body text size: Minimum 18px (larger than typical English due to character complexity)
- Line height: 1.8-2.0 (generous spacing improves character recognition)
- Line length: 45-75 characters maximum per line for comfortable reading
- Character spacing: Slight letter-spacing (0.02em) improves readability for dense characters

**Visual Hierarchy:**

- Article Title: 28-32px, bold
- Section Headers: 20-24px, semi-bold
- Body Text: 18-20px, regular
- Pinyin/Furigana: 10-12px, lighter weight
- UI Labels: 14-16px

### Color & Contrast

**Reading Modes:**

- Light mode (default): Black text (#1a1a1a) on off-white (#fafafa) - softer than pure white
- Future consideration: Dark mode for evening reading (#e0e0e0 text on #1e1e1e background)

**Interactive Elements:**

- Clickable words: Subtle underline on hover (dotted, not solid - less intrusive)
- Highlighted phrases: Semi-transparent yellow background (#ffd700, 20% opacity)
- Saved words: Blue underline or colored dot indicator (#3b82f6)
- New vocabulary: Slight bold or different color (#059669 green tint)

**Avoid:** Never use pure black (#000000) on pure white (#ffffff) - too harsh for extended reading.

## Interaction Patterns

### Word Popup Component

**Behavior:**

- Trigger: Single click/tap on word (not hover - hover is unreliable on trackpads and doesn't exist on mobile)
- Position: Appear below the clicked word to avoid covering surrounding text
- Animation: Fade in quickly (150ms) - no dramatic slides or bounces
- Dismissal: Click anywhere outside popup, ESC key, or click another word

**Content Structure:**

```
┌─────────────────────────┐
│ 学习 (xué xí)          │  ← Word + reading, larger
├─────────────────────────┤
│ to study, to learn     │  ← Definition, clear
│                         │
│ Example:                │  ← Label, muted color
│ 我每天学习中文           │  ← Example sentence
│ I study Chinese daily  │  ← Translation
├─────────────────────────┤
│ [Save to Word Bank]    │  ← Primary action button
└─────────────────────────┘
```

**Design Requirements:**

- Max width: 320px (readable without excessive eye movement)
- Padding: Generous internal spacing (16-20px)
- Shadow: Subtle drop shadow for depth (0 4px 12px rgba(0,0,0,0.1))
- Border radius: 8-12px (friendly, modern)
- Z-index: High enough to appear above all article content
- Arrow/pointer: Optional small triangle pointing to clicked word

### Phrase Highlighting Popup

**Trigger:** Click-drag selection (2+ words)

**Behavior:**

- Show popup immediately after mouseup/touchend
- Position near selection (above if space allows, below if near top)
- Auto-dismiss if user clicks elsewhere or starts new selection

**Content:**

```
┌──────────────────────────────┐
│ 我爱学习中文                  │  ← Selected phrase
├──────────────────────────────┤
│ Structure: Subject + 爱 + V │  ← Grammar pattern
│ "I love to study Chinese"   │  ← Translation
│                              │
│ This pattern expresses...   │  ← Brief explanation
├──────────────────────────────┤
│ [Save Phrase]                │
└──────────────────────────────┘
```

### Furigana Display (Japanese)

**Visual Treatment:**

- Use `<ruby>` and `<rt>` HTML tags (semantic and accessible)
- Furigana size: 50-55% of base text (10-11px if body is 18-20px)
- Color: Slightly muted (#4b5563) to distinguish from main text
- Spacing: Ensure adequate vertical space (line-height 2.0+) to prevent overlap

**Toggle Behavior:**

- Global toggle in top-right corner: Simple icon button (あ/漢)
- State persists across articles (save to user preferences)
- Smooth transition (fade out, not instant disappear)

**Auto-Hide Logic:**

- After 3+ encounters, hide furigana with subtle fade-out
- Show tooltip on hover: "You've seen this 3 times" (encourages progress awareness)
- User can always override with global toggle

## Progress & Feedback

### Immediate Feedback

**Word Saved:**

- Toast notification bottom-right: "Added to Word Bank" (3 second duration)
- Word in article gets subtle indicator (blue underline or dot)
- Micro-animation: Brief pulse or checkmark

**Article Completion:**

- Progress bar at bottom (fixed position, always visible)
- Percentage updates smoothly as user scrolls
- At 80% completion, show subtle prompt: "Almost done! Mark as complete?"

**Reading Time:**

- Small, unobtrusive timer in corner
- Format: "5m 32s" (not intimidating)
- Muted color, doesn't draw attention

### Progress Dashboard

**Key Metrics (Large, Celebratory):**

```
┌──────────────────────────────────────┐
│  📚 12 Articles Read This Week       │  ← Emoji + number, large
│  💯 156 Words Saved                  │
│  ⏱️  2h 34m Reading Time             │
└──────────────────────────────────────┘
```

**Activity Chart:**

- Line or bar chart, minimal styling
- Use brand colors (#3b82f6 blue, #059669 green)
- Show last 30 days by default
- Clear axis labels, grid lines (subtle, #e5e7eb)

**Avoid:**

- Overly gamified elements (badges, levels) - keep professional for classroom use
- Red/negative indicators for "not enough progress" - stay encouraging

## Teacher Dashboard

### Class Overview

**Design Priorities:**

- Scanability: Teacher needs to quickly identify struggling students
- Data density: Show multiple metrics without overwhelming
- Actionable insights: Highlight what needs attention

**Student List Table:**

```
┌────────────────────────────────────────────────────────────┐
│ Name          | Articles | Words | Last Active | Status   │
├────────────────────────────────────────────────────────────┤
│ Sarah Chen    |    12    |  156  | 2 hours ago | 🟢 Active│
│ Mike Liu      |    8     |   94  | 1 day ago   | 🟢 Active│
│ Alex Kim      |    2     |   23  | 8 days ago  | 🔴 Alert │ ← Red badge
└────────────────────────────────────────────────────────────┘
```

**Status Indicators:**

- 🟢 Green: Active within 3 days
- 🟡 Yellow: Inactive 4-7 days
- 🔴 Red: Inactive 8+ days or 0 articles in past week

**Click student → detailed view (modal or new page):**

- Timeline of activity (chronological list)
- List of completed articles with dates
- Word bank preview (top 10 recent words)
- Export button (prominent, top-right)

### Class Metrics Visualization

**Use Charts Purposefully:**

- Bar chart: Articles read per student (compare performance)
- Line chart: Class activity over time (trend awareness)
- Pie chart: Topic distribution (understand class interests)

**Chart Best Practices:**

- Use shadcn/ui's Recharts integration
- Minimal styling (no 3D effects, gradients)
- Accessible colors (don't rely only on color)
- Export to PNG option (for teacher presentations)

## Onboarding Flow

### Reduce Friction, Build Confidence

**Step 1: Interest Survey**

- Layout: Grid of topic cards (2-3 columns)
- Selection: Checkbox-style cards that highlight on select
- Visual: Icon + label for each topic (🍜 Food & Cooking)
- Progress: "1 of 3" indicator at top
- Skip option: "Skip, I'll explore everything" (some users hate commitment)

**Step 2: Level Selection**

- Layout: Vertical cards with clear descriptions
- Beginner card: "I know ~100-500 words" (concrete number helps)
- Visual: Show sample sentence for each level
- Reassurance: "You can change this anytime in settings"

**Step 3: Class Join (Optional)**

- Layout: Single input field, centered
- Placeholder: "Enter class code (e.g., ABC123)"
- Skip button: Prominent "Skip for now" option
- Error handling: "Code not found. Check with your teacher."

**Overall Flow:**

- Keep to 3 screens maximum
- Each screen: 1 clear goal
- No auto-advance (user controls pace)
- Can exit and resume later (save partial progress)

## Word Bank Interface

### Design for Quick Scanning

**List View (Default):**

```
┌──────────────────────────────────────────────────┐
│ [Search...] [Filter: All ▼] [Sort: Recent ▼]   │
├──────────────────────────────────────────────────┤
│ 学习 (xué xí)     to study        [Learning] ✏️│
│ 朋友 (péng you)   friend          [Mastered] ✓ │
│ 食べる (taberu)   to eat          [Learning] ✏️│
└──────────────────────────────────────────────────┘
```

**Card View (Alternative):**

- Flashcard-style, larger, 2-3 per row
- Click to flip and see definition
- Better for review sessions

**Filtering:**

- Learning / Mastered toggle (pill buttons)
- Language filter (Chinese / Japanese)
- Topic filter (based on which articles words came from)

**Actions:**

- Mark as Mastered (checkbox or toggle)
- Remove from word bank (trash icon, with confirmation)
- View in context (link back to source article)

**Empty State:**

- Friendly illustration or icon
- "Start reading articles to build your word bank"
- CTA button: "Browse Articles"

## Responsive Considerations (Future Mobile)

Even though MVP is web-only, design with mobile in mind:

**Touch Targets:**

- Minimum 44x44px for all interactive elements
- Generous padding around clickable words (increased hit area)
- Buttons: Minimum 48px height

**Spacing:**

- Increase padding on mobile (16px → 20px)
- Stack elements vertically instead of horizontal layouts
- Bottom navigation bar instead of sidebar

**Popups on Mobile:**

- Full-width on small screens (<640px)
- Slide up from bottom (more natural on mobile)
- Include close button (X in top-right)

## Accessibility Requirements

### Keyboard Navigation

**Essential shortcuts:**

- Tab: Navigate between words in article
- Enter: Open word popup for focused word
- Esc: Close popup
- Arrow keys: Navigate within word bank list
- /: Focus search input (common pattern)

**Focus indicators:**

- Visible outline on focused words (2px solid #3b82f6)
- Skip to main content link (for screen readers)

### Screen Reader Support

**ARIA labels:**

```html
<span
  class="word-clickable"
  role="button"
  aria-label="Click to see definition of 学习"
  tabindex="0"
>
  学习
</span>
```

**Live regions for feedback:**

```html
<div aria-live="polite" aria-atomic="true">Word added to word bank</div>
```

### Color Contrast

- All text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1
- Interactive elements: 3:1 against background
- Test with tools: WebAIM Contrast Checker, browser DevTools

## Error States & Edge Cases

### Graceful Degradation

**Dictionary API fails:**

- Show error in popup: "Definition not available"
- Offer manual input: "Add your own definition"
- Log error for debugging but don't crash

**No articles available:**

- Friendly empty state with illustration
- "No articles match your criteria"
- Suggest: "Try adjusting filters or exploring all topics"

**Slow loading:**

- Skeleton screens for article list (gray rectangles with shimmer effect)
- Spinner in popup while fetching definition
- Progress bar for article content loading

**Network offline:**

- Toast notification: "You're offline. Some features unavailable."
- Cache last read article for offline viewing (future enhancement)

## Performance & Perceived Performance

### Loading States

**Article loading:**

- Show title and first paragraph immediately (progressive loading)
- Fade in remaining content as it loads
- Skeleton for word count, metadata

**Dashboard metrics:**

- Stale-while-revalidate pattern (show cached data, update in background)
- Optimistic updates (update UI immediately, rollback if fails)

### Animation Performance

**Use CSS transforms (GPU-accelerated):**

```css
/* Good */
transform: translateY(10px);
opacity: 0.5;

/* Avoid */
top: 10px;
margin-top: 10px;
```

**Timing:**

- Micro-interactions: 150-200ms
- Page transitions: 300ms
- Nothing longer than 500ms

## Content & Microcopy

### Button Labels (Action-Oriented)

**Good:**

- "Save to Word Bank" (specific action)
- "Mark as Mastered" (clear outcome)
- "Start Reading" (encouraging)
- "View Student Progress" (explicit)

**Avoid:**

- "OK" / "Submit" (vague)
- "Click here" (obvious, not descriptive)
- "Continue" without context

### Empty States (Guide Next Action)

**Word Bank (empty):**

- Illustration: Open book with sparkles
- "Your word bank is empty"
- "Click words while reading to save them here"
- [Browse Articles] button

**No classes (teacher):**

- "Create your first class to get started"
- "Classes help you track student progress"
- [Create Class] button (prominent)

### Error Messages (Friendly, Actionable)

- Bad: "Error 401: Unauthorized"
- Good: "Please sign in again to continue"
- Bad: "Invalid input"
- Good: "Class code must be 6 characters. Check with your teacher."

## Testing Checklist

### Usability Testing Focus Areas

**Reading Interface:**

- Can users easily find and click words?
- Are popups positioned well (not covering important text)?
- Is furigana readable at current size?
- Do users understand how to save words?

**Navigation:**

- Can users find their word bank from any page?
- Is it clear how to return to article browsing?
- Do teachers know where to find student progress?

**Onboarding:**

- Do users complete all steps or drop off?
- Are level descriptions clear enough?
- Do users understand the class join code step?

### Cross-Browser Testing

- Chrome (primary)
- Firefox (check font rendering)
- Safari (different text rendering engine)
- Edge (similar to Chrome but test anyway)

### Device Testing (Future)

- Desktop: 1920x1080, 1366x768 (most common)
- Tablet: iPad Air (common in education)
- Mobile: iPhone 12/13 size, Android mid-range

## Design System Consistency

### Use shadcn/ui Components

Leverage these for consistency:

- Button (primary, secondary, ghost variants)
- Card (for article cards, metrics)
- Dialog (for confirmations, role selection)
- Popover (for word/phrase popups)
- Table (for teacher student list)
- Tabs (for dashboard sections)
- Toast (for notifications)
- Select (for filters, dropdowns)

**Customize minimally:**

- Override colors to match brand
- Adjust spacing for reading interface
- Keep default behavior (accessibility built-in)

### Spacing Scale (Tailwind)

Use consistent spacing:

- space-2 (8px): Tight spacing within components
- space-4 (16px): Standard padding
- space-6 (24px): Section separation
- space-8 (32px): Major section breaks

## Final UX Principles for This Project

1. **Reading comes first** - Don't clutter the article view
2. **Instant feedback** - Every interaction gets acknowledgment
3. **Progressive disclosure** - Show advanced features only when relevant
4. **Forgiveness** - Easy undo, clear confirmations for destructive actions
5. **Encouragement** - Celebrate progress, never shame for not knowing words
6. **Professionalism** - This will be used in classrooms; keep it polished and respectful

**Remember:** You are not your user. Test with real students and teachers regularly. Their struggles reveal what needs improvement.
