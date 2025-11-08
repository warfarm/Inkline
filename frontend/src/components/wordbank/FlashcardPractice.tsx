import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { WordBankEntry } from '@/types';

interface FlashcardPracticeProps {
  words: WordBankEntry[];
  onExit: () => void;
  onMarkMastered: (wordId: string) => void;
}

export function FlashcardPractice({ words, onExit, onMarkMastered }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<Set<string>>(new Set());

  const currentWord = words[currentIndex];
  const progress = currentIndex + 1;
  const total = words.length;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrevious();
      } else if (e.key === 'm') {
        handleMarkMastered();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setReviewedWords(new Set(reviewedWords).add(currentWord.id));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
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

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <p className="text-xl font-semibold">Practice Complete!</p>
        <p className="text-muted-foreground">
          You've reviewed {reviewedWords.size} word{reviewedWords.size !== 1 ? 's' : ''}
        </p>
        <Button onClick={onExit}>Exit Practice</Button>
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
          </p>
        </div>
        <Button variant="outline" onClick={onExit}>
          Exit Practice
        </Button>
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
              <div className="text-5xl font-bold mb-4">{currentWord.word}</div>
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
              <div className="text-3xl font-bold mb-4">{currentWord.word}</div>
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
          disabled={currentIndex === 0}
        >
          ← Previous (P)
        </Button>

        <div className="flex gap-2">
          {currentWord.status === 'learning' && (
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
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
        >
          Next (N) →
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><kbd className="px-2 py-1 bg-background rounded">Space</kbd> Flip</div>
            <div><kbd className="px-2 py-1 bg-background rounded">N/→</kbd> Next</div>
            <div><kbd className="px-2 py-1 bg-background rounded">P/←</kbd> Previous</div>
            <div><kbd className="px-2 py-1 bg-background rounded">M</kbd> Mark Mastered</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
