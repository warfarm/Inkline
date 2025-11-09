import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWordPopupMode } from '@/hooks/useWordPopupMode';
import { supabase } from '@/lib/supabase';
import { lookupJapanese } from '@/lib/dictionaries/jisho';
import { lookupChinese } from '@/lib/dictionaries/chinese';
import { segmentText } from '@/lib/segmentation';
import { WordPopup } from './WordPopup';
import { PhrasePopup } from './PhrasePopup';
import { toast } from 'sonner';
import type { Article, DictionaryResult } from '@/types';

interface ArticleReaderProps {
  article: Article;
  onComplete?: () => void;
}

export function ArticleReader({ article, onComplete }: ArticleReaderProps) {
  const { user, profile } = useAuth();
  const { mode: popupMode } = useWordPopupMode();
  const startTimeRef = useRef<number>(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const lastWordClickRef = useRef<{ word: string; timestamp: number } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const loadingRef = useRef<boolean>(false);
  const hasResultRef = useRef<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    phrase: string;
    position: { x: number; y: number };
  } | null>(null);
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);
  const [phraseResult, setPhraseResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [phraseLoading, setPhraseLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wordsSaved, setWordsSaved] = useState(0);
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  // Auto-segment full content if segmented_content is incomplete
  const segmentedWords = useMemo(() => {
    const existingWords = article.segmented_content?.words || [];

    // Check if segmentation is complete by comparing last word's end position with content length
    if (existingWords.length === 0) {
      // No segmentation - segment the full content
      console.log('No segmentation found, auto-segmenting full content...');
      return segmentText(article.content, article.language);
    }

    const lastWord = existingWords[existingWords.length - 1];
    const isComplete = lastWord && lastWord.end >= article.content.length;

    if (!isComplete) {
      // Incomplete segmentation - re-segment the full content
      console.log(`Incomplete segmentation detected (ends at ${lastWord?.end}, content length: ${article.content.length}), auto-segmenting full content...`);
      return segmentText(article.content, article.language);
    }

    // Segmentation is complete, use existing
    return existingWords;
  }, [article.content, article.segmented_content, article.language]);

  // Fetch saved words for visual indicators
  useEffect(() => {
    const fetchSavedWords = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('word_bank')
          .select('word')
          .eq('user_id', user.id)
          .eq('language', article.language);

        if (!error && data) {
          setSavedWords(new Set(data.map(w => w.word)));
        }
      } catch (error) {
        console.error('Error fetching saved words:', error);
      }
    };

    fetchSavedWords();
  }, [user, article.language]);

  useEffect(() => {
    if (selectedWord) {
      fetchDefinition(selectedWord.word);
    }
  }, [selectedWord]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePopup();
        handleClosePhrasePopup();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedWord, selectedPhrase]);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.split(/\s+/).length > 10) return;

      // Check if this selection is from a recent word click (within 100ms)
      const now = Date.now();
      if (lastWordClickRef.current &&
          lastWordClickRef.current.word === selectedText &&
          now - lastWordClickRef.current.timestamp < 100) {
        return; // Ignore this selection - it's from a word click
      }

      // Only trigger phrase selection if it spans multiple characters
      if (selectedText.length > 1) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Close word popup when opening phrase popup (mutual exclusion)
        setSelectedWord(null);
        setDictionaryResult(null);
        hasResultRef.current = false;

        setSelectedPhrase({
          phrase: selectedText,
          position: {
            x: rect.left,
            y: rect.bottom + 8,
          },
        });
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('mouseup', handleTextSelection);
      return () => contentElement.removeEventListener('mouseup', handleTextSelection);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scroll tracking effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

      setScrollProgress(Math.min(Math.round(scrollPercentage * 100), 100));

      if (scrollPercentage >= 0.8 && !hasTrackedCompletion) {
        trackCompletion();
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasTrackedCompletion, wordsSaved]);

  const trackCompletion = async () => {
    if (!user || hasTrackedCompletion) return;

    setHasTrackedCompletion(true);
    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await supabase.from('reading_history').insert({
        user_id: user.id,
        article_id: article.id,
        time_spent_seconds: timeSpentSeconds,
        words_saved_count: wordsSaved,
      });

      // Trigger feedback UI
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error tracking completion:', error);
    }
  };

  const fetchDefinition = async (word: string) => {
    setLoading(true);
    loadingRef.current = true;
    setDictionaryResult(null);
    hasResultRef.current = false;

    try {
      const result =
        article.language === 'ja'
          ? await lookupJapanese(word)
          : await lookupChinese(word);

      // If no result, create a "not found" result
      if (result) {
        setDictionaryResult(result);
        hasResultRef.current = true;
      } else {
        setDictionaryResult({
          word,
          reading: '',
          definition: 'No definition found for this word. Try selecting a different word or phrase.',
        });
        hasResultRef.current = true;
      }

      if (user) {
        await supabase.from('word_interactions').insert({
          user_id: user.id,
          article_id: article.id,
          word,
          interaction_type: 'click',
        });
      }
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDictionaryResult({
        word,
        reading: '',
        definition: 'Error loading definition. Please try again.',
      });
      hasResultRef.current = true;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.preventDefault();

    // Don't switch popup if already showing the same word
    if (selectedWord?.word === word) {
      return;
    }

    // Close phrase popup when opening word popup (mutual exclusion)
    setSelectedPhrase(null);
    setPhraseResult(null);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedWord({
      word,
      position: {
        x: rect.left,
        y: rect.bottom + 8,
      },
    });
  };

  const handleWordHover = (word: string, event: React.MouseEvent) => {
    // If already showing this exact word, just keep it visible
    if (selectedWord?.word === word) {
      // Clear any pending hide timeout to keep it visible
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      return;
    }

    // Clear any pending show timeout from previous hover
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // If a popup is already visible for a different word, require a longer hover
    const delay = selectedWord ? 400 : 300;

    // Close phrase popup when opening word popup (mutual exclusion)
    setSelectedPhrase(null);
    setPhraseResult(null);

    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // Add delay before showing popup to prevent rapid switching
    showTimeoutRef.current = window.setTimeout(() => {
      // Clear any pending hide timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      setSelectedWord({
        word,
        position: {
          x: rect.left,
          y: rect.bottom + 8,
        },
      });
    }, delay);
  };

  const handleWordLeave = () => {
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Longer delay before hiding to allow moving to popup or nearby words
    hoverTimeoutRef.current = window.setTimeout(() => {
      // Don't hide if currently loading or if we have a result
      // Check refs to get the current state when timeout fires, not when it was set
      if (loadingRef.current || hasResultRef.current) {
        return; // Keep the popup visible
      }

      setSelectedWord(null);
      setDictionaryResult(null);
    }, 500);
  };

  const handlePopupMouseEnter = () => {
    // Cancel hide timeout when hovering over popup
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    // Hide popup when leaving it
    setSelectedWord(null);
    setDictionaryResult(null);
    hasResultRef.current = false;
  };

  const handleSaveWord = async (userNotes?: string) => {
    if (!dictionaryResult || !user) return;

    setSaving(true);
    try {
      console.log('Saving word with enhanced data:', {
        word: dictionaryResult.word,
        userNotes,
        grammarNotes: dictionaryResult.grammarNotes,
        formalityLevel: dictionaryResult.formalityLevel,
        usageNotes: dictionaryResult.usageNotes,
        additionalDefinitions: dictionaryResult.definitions
      });

      const { error: insertError } = await supabase.from('word_bank').insert({
        user_id: user.id,
        word: dictionaryResult.word,
        language: article.language,
        definition: dictionaryResult.definition,
        reading: dictionaryResult.reading,
        example_sentence: dictionaryResult.example,
        user_notes: userNotes,
        grammar_notes: dictionaryResult.grammarNotes,
        formality_level: dictionaryResult.formalityLevel,
        usage_notes: dictionaryResult.usageNotes,
        additional_definitions: dictionaryResult.definitions ? JSON.stringify(dictionaryResult.definitions) : null,
      });

      if (insertError) {
        console.error('Error inserting word:', insertError);
        throw insertError;
      }

      await supabase.from('word_interactions').insert({
        user_id: user.id,
        article_id: article.id,
        word: dictionaryResult.word,
        interaction_type: 'save',
      });

      setWordsSaved((prev) => prev + 1);
      setSavedWords(prev => new Set([...prev, dictionaryResult.word]));
      setSelectedWord(null);
      setDictionaryResult(null);
      hasResultRef.current = false;
      toast.success('Added to Word Bank', {
        description: `${dictionaryResult.word} saved successfully`,
        duration: 3000,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Already in Word Bank', {
          description: `${dictionaryResult.word} is already saved`,
          duration: 3000,
        });
        setSelectedWord(null);
        setDictionaryResult(null);
        hasResultRef.current = false;
      } else {
        console.error('Error saving word:', error);
        toast.error('Failed to save word', {
          description: 'Please try again',
          duration: 3000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
    setDictionaryResult(null);
    hasResultRef.current = false;
  };

  const handleClosePhrasePopup = () => {
    setSelectedPhrase(null);
    setPhraseResult(null);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    if (selectedPhrase) {
      fetchPhraseDefinition(selectedPhrase.phrase);
    }
  }, [selectedPhrase]);

  const fetchPhraseDefinition = async (phrase: string) => {
    setPhraseLoading(true);
    setPhraseResult(null);

    try {
      const result =
        article.language === 'ja'
          ? await lookupJapanese(phrase)
          : await lookupChinese(phrase);

      // Always set a result, even if not found
      if (result) {
        setPhraseResult(result);
      } else {
        setPhraseResult({
          word: phrase,
          reading: '',
          definition: 'No definition found for this phrase.',
        });
      }

      if (user) {
        await supabase.from('word_interactions').insert({
          user_id: user.id,
          article_id: article.id,
          word: phrase,
          interaction_type: 'phrase_highlight',
        });
      }
    } catch (error) {
      console.error('Error fetching phrase definition:', error);
      setPhraseResult({
        word: phrase,
        reading: '',
        definition: 'Error loading definition. Please try again.',
      });
    } finally {
      setPhraseLoading(false);
    }
  };

  const handleSavePhrase = async (userNotes?: string) => {
    if (!phraseResult || !user) return;

    setSaving(true);
    try {
      await supabase.from('word_bank').insert({
        user_id: user.id,
        word: phraseResult.word,
        language: article.language,
        definition: phraseResult.definition,
        reading: phraseResult.reading,
        example_sentence: phraseResult.example,
        user_notes: userNotes,
        grammar_notes: phraseResult.grammarNotes,
        formality_level: phraseResult.formalityLevel,
        usage_notes: phraseResult.usageNotes,
        additional_definitions: phraseResult.definitions ? JSON.stringify(phraseResult.definitions) : null,
      });

      await supabase.from('word_interactions').insert({
        user_id: user.id,
        article_id: article.id,
        word: phraseResult.word,
        interaction_type: 'save',
      });

      setWordsSaved((prev) => prev + 1);
      setSavedWords(prev => new Set([...prev, phraseResult.word]));
      handleClosePhrasePopup();
      toast.success('Added to Word Bank', {
        description: `${phraseResult.word} saved successfully`,
        duration: 3000,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Already in Word Bank', {
          description: `${phraseResult.word} is already saved`,
          duration: 3000,
        });
        handleClosePhrasePopup();
      } else {
        console.error('Error saving phrase:', error);
        toast.error('Failed to save phrase', {
          description: 'Please try again',
          duration: 3000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-[#1a1a1a]">{article.title}</h1>
        <div className="text-muted-foreground mb-4 text-base">
          {article.topic} • {article.word_count} words
        </div>

        <div
          ref={contentRef}
          className="space-y-4 text-[20px] leading-[2.0] tracking-[0.02em] select-text"
          style={{
            fontFamily: article.language === 'zh'
              ? "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
              : "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif"
          }}
        >
          {segmentedWords.map((wordData, index) => {
            const isSaved = savedWords.has(wordData.text);
            return (
              <span
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`${popupMode === 'hover' ? 'Hover' : 'Click'} to see definition of ${wordData.text}`}
                className={`cursor-pointer hover:underline hover:decoration-dotted hover:decoration-blue-500 hover:underline-offset-4 px-0.5 transition-all focus:outline-2 focus:outline-blue-600 focus:rounded ${
                  isSaved ? 'underline decoration-blue-600 decoration-solid underline-offset-4' : ''
                }`}
                onClick={popupMode === 'click' ? (e) => handleWordClick(wordData.text, e) : undefined}
                onMouseEnter={popupMode === 'hover' ? (e) => handleWordHover(wordData.text, e) : undefined}
                onMouseLeave={popupMode === 'hover' ? handleWordLeave : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (popupMode === 'click') {
                      handleWordClick(wordData.text, e as any);
                    } else {
                      handleWordHover(wordData.text, e as any);
                    }
                  }
                }}
              >
                {wordData.text}
              </span>
            );
          })}
        </div>
      </div>

      {selectedWord && loading && createPortal(
        <div
          className="fixed rounded-md bg-background border p-4 shadow-lg"
          style={{
            top: selectedWord.position.y,
            left: selectedWord.position.x,
            zIndex: 10001,
            isolation: 'isolate'
          }}
        >
          Loading...
        </div>,
        document.body
      )}

      {selectedWord && dictionaryResult && (
        <WordPopup
          result={dictionaryResult}
          position={selectedWord.position}
          onSave={handleSaveWord}
          onClose={handleClosePopup}
          saving={saving}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
          profile={profile}
        />
      )}

      {selectedPhrase && (
        <PhrasePopup
          phrase={selectedPhrase.phrase}
          result={phraseResult}
          position={selectedPhrase.position}
          loading={phraseLoading}
          onSave={handleSavePhrase}
          onClose={handleClosePhrasePopup}
          saving={saving}
          profile={profile}
        />
      )}

      {/* Progress Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur border-t border-gray-200 shadow-lg" style={{ zIndex: 50 }}>
        <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
            <span className="font-medium">Progress: {scrollProgress}%</span>
            <span className="font-medium">Time: {Math.floor(timeSpent / 60)}m {String(timeSpent % 60).padStart(2, '0')}s</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
