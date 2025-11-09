import { Button } from '@/components/ui/button';
import type { DictionaryResult } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Profile {
  target_language?: string;
}

interface PhrasePopupProps {
  phrase: string;
  result: DictionaryResult | null;
  position: { x: number; y: number };
  loading: boolean;
  onSave: (userNotes?: string) => void;
  onClose: () => void;
  saving: boolean;
  profile?: Profile | null;
}

export function PhrasePopup({
  phrase,
  result,
  position,
  loading,
  onSave,
  onClose,
  saving,
  profile,
}: PhrasePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust horizontal position if popup goes off right edge
      if (x + rect.width > viewportWidth - 20) {
        x = viewportWidth - rect.width - 20;
      }

      // Adjust horizontal position if popup goes off left edge
      if (x < 20) {
        x = 20;
      }

      // Adjust vertical position if popup goes off bottom edge
      if (y + rect.height > viewportHeight - 20) {
        y = Math.max(20, viewportHeight - rect.height - 20);
      }

      // Adjust vertical position if popup goes off top edge
      if (y < 20) {
        y = 20;
      }

      setAdjustedPosition({ x, y });
    }
  }, [position, result, loading]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window && result) {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Add a small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(result.word);

        // Use user's target language preference, with fallback to character detection
        let language = 'zh-CN'; // Default to Chinese
        if (profile?.target_language === 'ja') {
          language = 'ja-JP';
        } else if (profile?.target_language === 'zh') {
          language = 'zh-CN';
        } else {
          // Fallback: detect language from characters if no profile setting
          const hasHiragana = /[\u3040-\u309F]/.test(result.word);
          const hasKatakana = /[\u30A0-\u30FF]/.test(result.word);
          const isJapanese = hasHiragana || hasKatakana;
          language = isJapanese ? 'ja-JP' : 'zh-CN';
        }

        utterance.lang = language;
        utterance.rate = 0.8;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
          // Only show error if it's not an "interrupted" error
          if (event.error !== 'interrupted') {
            console.warn('TTS error (non-critical):', event.error);
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

  return createPortal(
    <>
      {/* Backdrop to close popup on outside click */}
      <div
        className="fixed inset-0 bg-transparent"
        style={{ zIndex: 10000 }}
        onClick={onClose}
      />

      <div
        ref={popupRef}
        className="fixed max-w-md max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:max-w-full rounded-lg max-sm:rounded-t-lg max-sm:rounded-b-none border-2 border-primary/20 bg-card p-4 shadow-2xl"
        style={{
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          zIndex: 10001,
          isolation: 'isolate',
          backgroundColor: 'hsl(var(--card))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Looking up phrase...</p>
          </div>
        ) : result ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold">{result.word}</div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className="h-10 w-10 p-0 text-xl transition-transform hover:scale-110"
                  title="Listen to pronunciation"
                >
                  <span className="inline-block transition-transform hover:scale-125">
                    {isSpeaking ? '⏸' : '🔊'}
                  </span>
                </Button>
              </div>
              {result.reading && (
                <div className="text-sm text-muted-foreground mb-2">{result.reading}</div>
              )}
            </div>

            <div className="text-sm border-t pt-3">
              <div className="font-medium mb-1">Definition:</div>
              <div>{result.definition}</div>
            </div>

            {result.example && (
              <div className="rounded-md bg-muted p-2 text-sm">
                <div className="text-xs font-medium text-muted-foreground mb-1">Example:</div>
                <div>{result.example}</div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={() => onSave()} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save to Word Bank'}
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-lg font-semibold">{phrase}</div>
            <div className="text-sm text-muted-foreground">
              No definition found for this phrase. Try selecting individual words.
            </div>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
