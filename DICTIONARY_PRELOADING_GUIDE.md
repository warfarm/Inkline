# Dictionary Preloading Guide

The Chinese dictionary can be preloaded to ensure instant lookups from the first word. Here are all the ways to preload it:

## ✅ Already Implemented: Automatic Preloading

The dictionary now **automatically preloads** in `App.tsx` when a Chinese learner logs in:

```typescript
// In App.tsx (lines 28-37)
useEffect(() => {
  if (profile?.target_language === 'chinese') {
    console.log('[App] Preloading Chinese dictionary for user...');
    loadFullChineseDict().then(() => {
      console.log('[App] Chinese dictionary preloaded successfully');
    }).catch((error) => {
      console.error('[App] Failed to preload Chinese dictionary:', error);
    });
  }
}, [profile?.target_language]);
```

**Behavior**:
- ✅ Loads in background as soon as user logs in
- ✅ Doesn't block UI or navigation
- ✅ Console logs show loading status
- ✅ Only loads for Chinese learners (not Japanese)

## Option 1: Silent Preloading (Current Implementation)

**Use Case**: Best for most users - loads in background without UI
**Status**: ✅ Already implemented in App.tsx

**Pros**:
- Non-intrusive
- Doesn't distract user
- Starts loading immediately after login

**Cons**:
- User doesn't know if dictionary is loaded
- No visual feedback if loading fails

## Option 2: Visual Preloading with Toast Notification

Show a toast notification during loading:

```typescript
// In App.tsx
import { useEffect } from 'react';
import { toast } from 'sonner';
import { loadFullChineseDict, getChineseDictStats } from '@/lib/dictionaries/chinese';

useEffect(() => {
  if (profile?.target_language === 'chinese') {
    const stats = getChineseDictStats();

    if (!stats.fullDictLoaded && !stats.fullDictLoading) {
      const toastId = toast.loading('Loading Chinese dictionary...', {
        description: '196K words',
      });

      loadFullChineseDict()
        .then(() => {
          toast.success('Dictionary loaded!', {
            id: toastId,
            description: '196,574 words ready',
          });
        })
        .catch((error) => {
          toast.error('Failed to load dictionary', {
            id: toastId,
            description: 'Will retry on first lookup',
          });
        });
    }
  }
}, [profile?.target_language]);
```

**Pros**:
- User gets feedback
- Non-blocking
- Professional UX

**Cons**:
- Adds toast library dependency (already using Sonner)

## Option 3: Bottom-Right Notification Component

Use the pre-built `DictionaryPreloader` component:

```typescript
// In App.tsx
import { DictionaryPreloader } from '@/components/dictionary/DictionaryPreloader';

function App() {
  // ... existing code

  return (
    <>
      <DictionaryPreloader />
      <Routes>
        {/* ... routes */}
      </Routes>
    </>
  );
}
```

**Pros**:
- Beautiful visual feedback
- Shows loading progress
- Includes retry button on error
- Auto-hides after 2 seconds

**Cons**:
- Slightly more visual noise

## Option 4: Eager Loading in main.tsx

Load dictionary even before React renders:

```typescript
// In main.tsx (before ReactDOM.render)
import { loadFullChineseDict } from '@/lib/dictionaries/chinese';

// Start loading immediately (for all users)
loadFullChineseDict();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Pros**:
- Earliest possible loading
- Dictionary ready by time user sees anything

**Cons**:
- Loads even for Japanese learners (wastes bandwidth)
- No user context yet
- Increases initial load time

## Option 5: Service Worker Caching

Cache dictionary in Service Worker for offline use:

```javascript
// In public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('inkline-v1').then((cache) => {
      return cache.addAll([
        '/chinese-dict.json',
        // ... other assets
      ]);
    })
  );
});
```

**Pros**:
- Works offline
- Instant on repeat visits
- Reduces server load

**Cons**:
- Requires Service Worker setup
- First load still downloads 15MB

## Option 6: IndexedDB Persistent Caching

Store dictionary in IndexedDB for long-term caching:

```typescript
import { openDB } from 'idb';

async function loadWithCache() {
  const db = await openDB('inkline-dictionary', 1, {
    upgrade(db) {
      db.createObjectStore('dictionaries');
    },
  });

  // Try IndexedDB first
  let dict = await db.get('dictionaries', 'chinese');

  if (!dict) {
    // Download and cache
    const response = await fetch('/chinese-dict.json');
    dict = await response.json();
    await db.put('dictionaries', dict, 'chinese');
  }

  return dict;
}
```

**Pros**:
- Persists across sessions
- Very fast on repeat visits
- Offline support

**Cons**:
- More complex implementation
- Requires idb library
- Need cache invalidation strategy

## Option 7: Conditional Preloading Based on User Activity

Only preload when user shows intent to read:

```typescript
// In Home.tsx or ArticleView.tsx
useEffect(() => {
  // User is viewing articles, likely to click words soon
  if (profile?.target_language === 'chinese') {
    loadFullChineseDict();
  }
}, []);
```

**Pros**:
- Loads closer to actual need
- Reduces unnecessary loads

**Cons**:
- Might not be ready for first word click

## Comparison Table

| Method | Timing | Visual Feedback | Offline | Complexity |
|--------|--------|-----------------|---------|------------|
| **Current (Silent)** | On login | Console only | No | ⭐ Low |
| Toast Notification | On login | Toast | No | ⭐ Low |
| Corner Component | On login | Box | No | ⭐⭐ Medium |
| main.tsx Eager | Before React | None | No | ⭐ Low |
| Service Worker | On install | None | Yes | ⭐⭐⭐ High |
| IndexedDB | On first load | Custom | Yes | ⭐⭐⭐ High |
| On-Demand | When needed | None | No | ⭐ Low |

## Recommended Approach

**For most users**: Current implementation (silent preloading) is ideal
- Loads automatically for Chinese learners
- Non-blocking and non-intrusive
- Good balance of performance and UX

**To add visual feedback**: Use the `DictionaryPreloader` component
```typescript
// In App.tsx
import { DictionaryPreloader } from '@/components/dictionary/DictionaryPreloader';

return (
  <>
    <DictionaryPreloader />
    <Routes>...</Routes>
  </>
);
```

**For power users**: Implement IndexedDB caching for long-term persistence

## Testing Preloading

### 1. Check Console Logs
```
[App] Preloading Chinese dictionary for user...
[Chinese Dict] Loading full CC-CEDICT dictionary...
[Chinese Dict] Loaded 196574 entries
[App] Chinese dictionary preloaded successfully
```

### 2. Check Network Tab
- Look for `/chinese-dict.json` request
- Should be ~15.6MB
- Should only load once per session

### 3. Test in Console
```javascript
import { getChineseDictStats } from '@/lib/dictionaries/chinese';

// Check if loaded
const stats = getChineseDictStats();
console.log(stats);
// {
//   fullDictLoaded: true,
//   fullDictLoading: false,
//   fullDictSize: 196574,
//   basicDictSize: 907
// }
```

### 4. Test Lookup Speed
```javascript
import { lookupChinese } from '@/lib/dictionaries/chinese';

console.time('lookup');
const result = await lookupChinese('人工智能');
console.timeEnd('lookup');
// lookup: 0.5ms (should be < 1ms)
```

## Monitoring Performance

### Check Memory Usage
```javascript
// In browser console
performance.memory?.usedJSHeapSize / 1024 / 1024
// Should show ~30-40MB increase after dictionary loads
```

### Check Load Time
```javascript
// Add performance marks
performance.mark('dict-start');
await loadFullChineseDict();
performance.mark('dict-end');
performance.measure('dict-load', 'dict-start', 'dict-end');

const measure = performance.getEntriesByName('dict-load')[0];
console.log(`Dictionary loaded in ${measure.duration}ms`);
// Typical: 1000-3000ms on good connection
```

## Troubleshooting

### Dictionary not preloading
1. Check user's `target_language` is `'chinese'` (not `'Chinese'` or other)
2. Check console for errors
3. Verify `/chinese-dict.json` exists in public folder
4. Check Network tab for 404 errors

### Slow loading
1. Check network connection speed
2. Consider serving gzipped version (reduces to 3.8MB)
3. Use CDN for faster delivery

### High memory usage
- Expected: 30-40MB for dictionary
- Memory freed when tab closes
- Consider IndexedDB if memory is critical

## Future Optimizations

1. **Gzip compression**: Serve compressed version (3.8MB instead of 15.6MB)
2. **Lazy chunks**: Split dictionary into frequency-based chunks
3. **Binary format**: Use Protocol Buffers for smaller size
4. **CDN hosting**: Serve from global CDN
5. **Smart preloading**: Only preload HSK 1-4 words initially (10% of size)

---

**Current Status**: ✅ Automatic preloading implemented in App.tsx

**Performance**: Dictionary loads in 1-3 seconds, lookups < 1ms

**Coverage**: 196,574 Chinese words ready for instant access
