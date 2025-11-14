import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Volume2, Pause, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { WordBankEntry } from '@/types';

interface Profile {
  target_language?: string;
}

interface FlashcardPracticeProps {
  words: WordBankEntry[];
  onExit: () => void;
  onMarkMastered: (wordId: string) => void;
  profile?: Profile | null;
  setId?: string; // Optional: If practicing from a specific set
  userId?: string; // For tracking per-set review stats
}

export function FlashcardPractice({ words, onExit, onMarkMastered, profile, setId, userId }: FlashcardPracticeProps) {
  const [shuffledWords, setShuffledWords] = useState<WordBankEntry[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<Set<string>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [practiceSessionId, setPracticeSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  const currentWord = shuffledWords[currentIndex];
  const progress = currentIndex + 1;
  const total = shuffledWords.length;

  // Start practice session if practicing from a set
  useEffect(() => {
    if (setId && userId) {
      startPracticeSession();
    }

    // Cleanup: Complete session on unmount
    return () => {
      if (practiceSessionId && setId && userId) {
        completePracticeSession();
      }
    };
  }, []);

  const startPracticeSession = async () => {
    if (!setId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('word_set_practice_history')
        .insert({
          set_id: setId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setPracticeSessionId(data.id);
      startTimeRef.current = new Date();
    } catch (err) {
      console.error('Error starting practice session:', err);
    }
  };

  const completePracticeSession = async () => {
    if (!practiceSessionId) return;

    const timeSpent = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('word_set_practice_history')
        .update({
          completed_at: new Date().toISOString(),
          cards_reviewed: reviewedWords.size,
          cards_correct: correctCount,
          cards_incorrect: incorrectCount,
          time_spent_seconds: timeSpent,
        })
        .eq('id', practiceSessionId);

      if (error) throw error;
    } catch (err) {
      console.error('Error completing practice session:', err);
    }
  };

  // Increment per-set review count
  const incrementSetReviewCount = async (wordId: string) => {
    if (!setId) return;

    try {
      // Find the set item
      const { data: items, error: fetchError } = await supabase
        .from('word_set_items')
        .select('id, times_reviewed_in_set')
        .eq('set_id', setId)
        .eq('word_bank_id', wordId)
        .single();

      if (fetchError) throw fetchError;

      if (items) {
        const { error: updateError } = await supabase
          .from('word_set_items')
          .update({
            times_reviewed_in_set: (items.times_reviewed_in_set || 0) + 1,
            last_reviewed_in_set: new Date().toISOString(),
          })
          .eq('id', items.id);

        if (updateError) throw updateError;
      }
    } catch (err) {
      console.error('Error incrementing set review count:', err);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P' || e.key === 'b' || e.key === 'B') {
        handlePrevious();
      } else if (e.key === 'm' || e.key === 'M') {
        handleMarkMastered();
      } else if (e.key === 'y' || e.key === 'Y') {
        handleNext(true); // I know this
      } else if (e.key === 'x' || e.key === 'X') {
        handleNext(false); // I don't know this
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex]);

  const handleNext = async (wasCorrect?: boolean) => {
    // Track review
    setReviewedWords(new Set(reviewedWords).add(currentWord.id));

    // Update stats if provided
    if (wasCorrect === true) {
      setCorrectCount(prev => prev + 1);
    } else if (wasCorrect === false) {
      setIncorrectCount(prev => prev + 1);
    }

    // Increment per-set review count if practicing from a set
    if (setId) {
      await incrementSetReviewCount(currentWord.id);
    }

    // Move to next card
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    } else {
      // Loop back to the end
      setCurrentIndex(shuffledWords.length - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && currentWord) {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Add a small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);

        // Use user's target language preference, with fallback to character detection
        let language = 'zh-CN'; // Default to Chinese
        if (profile?.target_language === 'ja') {
          language = 'ja-JP';
        } else if (profile?.target_language === 'zh') {
          language = 'zh-CN';
        } else if (profile?.target_language === 'ko') {
          language = 'ko-KR';
        } else {
          // Fallback: detect language from characters if no profile setting
          const hasHiragana = /[\u3040-\u309F]/.test(currentWord.word);
          const hasKatakana = /[\u30A0-\u30FF]/.test(currentWord.word);
          const hasHangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(currentWord.word);
          const isJapanese = hasHiragana || hasKatakana;
          const isKorean = hasHangul;
          language = isJapanese ? 'ja-JP' : isKorean ? 'ko-KR' : 'zh-CN';
        }

        utterance.lang = language;
        utterance.rate = 0.8;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          // Only show error if it's not an "interrupted" error (which is expected when cancelling)
          if (event.error !== 'interrupted') {
            toast.error('Unable to play audio for this word');
          }
        };

        // Ensure voices are loaded before speaking
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            window.speechSynthesis.speak(utterance);
          }, { once: true });
        } else {
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    }
  };

  const handleMarkMastered = () => {
    if (currentWord.status === 'learning') {
      onMarkMastered(currentWord.id);
      if (currentIndex < words.length - 1) {
        handleNext();
      }
    }
  };

  const handleExitPractice = async () => {
    if (practiceSessionId && setId && userId) {
      await completePracticeSession();
    }
    onExit();
  };

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <p className="text-xl font-semibold">Practice Complete!</p>
        <p className="text-muted-foreground">
          You've reviewed {reviewedWords.size} word{reviewedWords.size !== 1 ? 's' : ''}
        </p>
        {setId && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✅ Correct: {correctCount}</p>
            <p>❌ Incorrect: {incorrectCount}</p>
          </div>
        )}
        <Button onClick={handleExitPractice}>Exit Practice</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Flashcard Practice</h3>
          <p className="text-sm text-muted-foreground">
            {progress} of {total}
            {setId && <span className="ml-2">• ✅ {correctCount} ❌ {incorrectCount}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShuffle}>
            🔀 Shuffle
          </Button>
          <Button variant="outline" onClick={handleExitPractice}>
            Exit Practice
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <Card
        className="min-h-[400px] cursor-pointer hover:border-primary transition-all transform-gpu"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8">
          {!isFlipped ? (
            // Front: Word
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-5xl font-bold">{currentWord.word}</div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak();
                  }}
                  disabled={isSpeaking}
                  className="h-12 w-12 p-0"
                  title="Listen to pronunciation"
                >
                  {isSpeaking ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </Button>
              </div>
              {currentWord.reading && (
                <div className="text-2xl text-muted-foreground">{currentWord.reading}</div>
              )}
              <div className="text-sm text-muted-foreground mt-8">
                Click or press Space to reveal definition
              </div>
            </div>
          ) : (
            // Back: Definition
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-3xl font-bold">{currentWord.word}</div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak();
                  }}
                  disabled={isSpeaking}
                  className="h-10 w-10 p-0"
                  title="Listen to pronunciation"
                >
                  {isSpeaking ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {currentWord.reading && (
                <div className="text-xl text-muted-foreground">{currentWord.reading}</div>
              )}
              <div className="text-xl mt-6">{currentWord.definition}</div>
              {currentWord.example_sentence && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Example:</div>
                  <div className="text-base">{currentWord.example_sentence}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
        >
          <ChevronLeft className="inline h-4 w-4" /> Previous (B)
        </Button>

        <div className="flex gap-2">
          {setId && isFlipped && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleNext(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Don't Know (X)
              </Button>
              <Button
                variant="default"
                onClick={() => handleNext(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                I Know This (Y)
              </Button>
            </>
          )}
          {!setId && currentWord.status === 'learning' && (
            <Button variant="default" onClick={handleMarkMastered}>
              Mark Mastered (M)
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            Flip Card (Space)
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => handleNext()}
        >
          Next (N) <ChevronRight className="inline h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-5 gap-2">
            <div><kbd className="px-2 py-1 bg-background rounded">Space</kbd> Flip</div>
            <div><kbd className="px-2 py-1 bg-background rounded">N/<ChevronRight className="inline h-3 w-3" /></kbd> Next</div>
            <div><kbd className="px-2 py-1 bg-background rounded">B/P/<ChevronLeft className="inline h-3 w-3" /></kbd> Previous</div>
            {setId ? (
              <>
                <div><kbd className="px-2 py-1 bg-background rounded">Y</kbd> Know</div>
                <div><kbd className="px-2 py-1 bg-background rounded">X</kbd> Don't Know</div>
              </>
            ) : (
              <div><kbd className="px-2 py-1 bg-background rounded">M</kbd> Mark Mastered</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
