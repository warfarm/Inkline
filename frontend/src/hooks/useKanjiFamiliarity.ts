import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { extractKanji } from '@/lib/segmentation';

interface KanjiFamiliarityData {
  [kanji: string]: {
    timesEncountered: number;
    showFurigana: boolean;
  };
}

export function useKanjiFamiliarity(articleText: string) {
  const { user } = useAuth();
  const [familiarityData, setFamiliarityData] = useState<KanjiFamiliarityData>({});
  const [furiganaEnabled, setFuriganaEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && articleText) {
      loadKanjiFamiliarity();
    }
  }, [user, articleText]);

  const loadKanjiFamiliarity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Extract all kanji from the article
      const kanjiInArticle = extractKanji(articleText);

      if (kanjiInArticle.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch familiarity data for these kanji
      const { data, error } = await supabase
        .from('kanji_familiarity')
        .select('kanji_character, times_encountered, show_furigana')
        .eq('user_id', user.id)
        .in('kanji_character', kanjiInArticle);

      if (error) throw error;

      // Build familiarity map
      const familiarityMap: KanjiFamiliarityData = {};

      for (const kanji of kanjiInArticle) {
        const existingData = data?.find((d) => d.kanji_character === kanji);

        if (existingData) {
          familiarityMap[kanji] = {
            timesEncountered: existingData.times_encountered,
            showFurigana: existingData.show_furigana,
          };
        } else {
          // New kanji - show furigana by default
          familiarityMap[kanji] = {
            timesEncountered: 0,
            showFurigana: true,
          };
        }
      }

      setFamiliarityData(familiarityMap);
    } catch (error) {
      console.error('Error loading kanji familiarity:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackKanjiEncounter = async (kanji: string) => {
    if (!user || !kanji) return;

    try {
      const currentData = familiarityData[kanji];
      const newEncounterCount = (currentData?.timesEncountered || 0) + 1;

      // Auto-hide furigana after 3 encounters
      const shouldShowFurigana = newEncounterCount < 3;

      // Upsert kanji familiarity data
      const { error } = await supabase.from('kanji_familiarity').upsert({
        user_id: user.id,
        kanji_character: kanji,
        times_encountered: newEncounterCount,
        show_furigana: shouldShowFurigana,
        last_seen_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state
      setFamiliarityData((prev) => ({
        ...prev,
        [kanji]: {
          timesEncountered: newEncounterCount,
          showFurigana: shouldShowFurigana,
        },
      }));
    } catch (error) {
      console.error('Error tracking kanji encounter:', error);
    }
  };

  const trackArticleKanji = async () => {
    if (!user || !articleText) return;

    const kanjiInArticle = extractKanji(articleText);

    for (const kanji of kanjiInArticle) {
      await trackKanjiEncounter(kanji);
    }
  };

  const shouldShowFuriganaForKanji = (kanji: string): boolean => {
    if (!furiganaEnabled) return false;

    const data = familiarityData[kanji];
    if (!data) return true; // Show by default for new kanji

    return data.showFurigana;
  };

  const toggleFurigana = () => {
    setFuriganaEnabled(!furiganaEnabled);
  };

  return {
    shouldShowFuriganaForKanji,
    trackArticleKanji,
    furiganaEnabled,
    toggleFurigana,
    loading,
  };
}
