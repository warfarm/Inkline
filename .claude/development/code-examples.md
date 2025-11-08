# Specific Implementation Code Examples

## Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Dictionary API Integration

```typescript
// src/lib/dictionaries/jisho.ts
export async function lookupJapanese(word: string): Promise<DictionaryResult | null> {
  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const entry = data.data[0];
      return {
        word: entry.japanese[0].word || entry.japanese[0].reading,
        reading: entry.japanese[0].reading,
        definition: entry.senses[0].english_definitions.join(', '),
        example: entry.senses[0].example_sentence || undefined
      };
    }
    return null;
  } catch (error) {
    console.error('Jisho lookup error:', error);
    return null;
  }
}
```

## Furigana Auto-Hide Logic

```typescript
// src/lib/furigana.ts
export async function shouldShowFurigana(
  userId: string,
  kanji: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('kanji_familiarity')
    .select('show_furigana, times_encountered')
    .eq('user_id', userId)
    .eq('kanji_character', kanji)
    .single();

  if (error || !data) {
    // First time seeing this kanji, show furigana
    return true;
  }

  // Auto-hide after 3 encounters, unless user overrode
  if (data.times_encountered >= 3 && data.show_furigana === false) {
    return false;
  }

  return data.show_furigana;
}

export async function trackKanjiEncounter(
  userId: string,
  kanji: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('kanji_familiarity')
    .select('id, times_encountered')
    .eq('user_id', userId)
    .eq('kanji_character', kanji)
    .single();

  if (existing) {
    await supabase
      .from('kanji_familiarity')
      .update({
        times_encountered: existing.times_encountered + 1,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('kanji_familiarity')
      .insert({
        user_id: userId,
        kanji_character: kanji,
        times_encountered: 1,
        show_furigana: true
      });
  }
}
```
