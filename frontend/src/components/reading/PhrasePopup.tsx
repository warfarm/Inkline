import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { DictionaryResult } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, Pause, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showMore, setShowMore] = useState(false);
  const [userNote, setUserNote] = useState('');

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

  const handleSpeak = async () => {
    // Use result.word if available (full phrase from API), otherwise use the selected phrase text
    const textToSpeak = result?.word || phrase;
    console.log('Speaking phrase:', textToSpeak);

    // Determine language
    let language = 'zh-CN'; // Default to Chinese
    if (profile?.target_language === 'ja') {
      language = 'ja-JP';
    } else if (profile?.target_language === 'zh') {
      language = 'zh-CN';
    } else if (profile?.target_language === 'ko') {
      language = 'ko-KR';
    } else {
      // Fallback: detect language from characters
      const hasHiragana = /[\u3040-\u309F]/.test(textToSpeak);
      const hasKatakana = /[\u30A0-\u30FF]/.test(textToSpeak);
      const hasHangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(textToSpeak);

      if (hasHiragana || hasKatakana) {
        language = 'ja-JP';
      } else if (hasHangul) {
        language = 'ko-KR';
      } else {
        language = 'zh-CN';
      }
    }

    setIsSpeaking(true);

    try {
      // Try Web Speech API first
      if ('speechSynthesis' in window) {
        const success = await tryBrowserTTS(textToSpeak, language);
        if (success) {
          return; // Success!
        }
      }

      // Fallback: Try Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        try {
          console.log('Trying Supabase Edge Function for phrase...');

          const edgeUrl = `${supabaseUrl}/functions/v1/tts?text=${encodeURIComponent(textToSpeak)}&lang=${language}`;

          const response = await fetch(edgeUrl, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const audio = new Audio(blobUrl);
            audio.onplay = () => console.log('Supabase TTS started (phrase):', textToSpeak);
            audio.onended = () => {
              console.log('Supabase TTS ended');
              setIsSpeaking(false);
              URL.revokeObjectURL(blobUrl);
            };
            audio.onerror = () => {
              console.error('Audio playback error');
              setIsSpeaking(false);
              URL.revokeObjectURL(blobUrl);
            };

            await audio.play();
            return; // Success!
          } else {
            console.warn('Supabase Edge Function returned:', response.status);
          }
        } catch (edgeError) {
          console.warn('Supabase Edge Function failed:', edgeError);
        }
      }

      // If all methods failed, throw error
      throw new Error('All TTS methods failed');

    } catch (error) {
      console.error('TTS unavailable:', error);
      setIsSpeaking(false);
    }
  };

  const tryBrowserTTS = async (text: string, language: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        resolve(false);
        return;
      }

      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const speakWithVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);

        // Find appropriate voice for the language
        const langCode = language.split('-')[0]; // 'ja', 'zh', 'ko'
        const targetVoice = voices.find(voice => voice.lang.startsWith(langCode));

        // If no native voice is available, return false to try other TTS methods
        if (!targetVoice) {
          console.log(`No ${langCode} voice found. Available languages:`,
            [...new Set(voices.map(v => v.lang))].join(', '));
          console.log('Will try alternative TTS method...');
          setIsSpeaking(false);
          resolve(false);
          return;
        }

        console.log('Using native voice:', targetVoice.name);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.8;
        utterance.voice = targetVoice;

        utterance.onstart = () => {
          console.log('Browser TTS started (phrase):', text);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('Browser TTS ended');
          setIsSpeaking(false);
          resolve(true);
        };

        utterance.onerror = (event) => {
          console.error('Browser TTS error:', event);
          setIsSpeaking(false);
          resolve(false);
        };

        console.log('Speaking with browser TTS...');
        window.speechSynthesis.speak(utterance);
      };

      // Wait for voices to be loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.log('Waiting for voices to load...');
        let hasSpoken = false;

        const speakOnce = () => {
          if (!hasSpoken) {
            hasSpoken = true;
            speakWithVoices();
          }
        };

        window.speechSynthesis.addEventListener('voiceschanged', speakOnce, { once: true });
        // Also try after a delay in case event doesn't fire
        setTimeout(speakOnce, 500);
      } else {
        speakWithVoices();
      }
    });
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
        className="fixed max-sm:left-0 max-sm:right-0 max-sm:bottom-0"
        style={{
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          zIndex: 10001,
          isolation: 'isolate',
          animation: 'popupAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-96 max-w-[90vw] max-sm:w-full max-sm:rounded-t-lg max-sm:rounded-b-none shadow-2xl border-2 border-primary/20 backdrop-blur-md bg-card/95" style={{ backgroundColor: 'hsl(var(--card) / 0.95)', maxHeight: '70vh', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Looking up phrase...</p>
            </div>
          ) : result ? (
            <>
              <div className={`p-4 ${showMore ? 'pb-8' : 'pb-4'} space-y-3 overflow-y-auto`} style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold">{result.word}</div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className="h-10 w-10 p-0 transition-transform hover:scale-110"
                  title="Listen to pronunciation"
                >
                  {isSpeaking ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
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

            {result.example && !showMore && (
              <div className="rounded-md bg-muted p-2 text-sm">
                <div className="text-xs font-medium text-muted-foreground mb-1">Example:</div>
                <div>{result.example}</div>
              </div>
            )}

            {/* Show More Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="w-full text-xs"
            >
              {showMore ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show More
                </>
              )}
            </Button>

            {/* Expanded Content */}
            {showMore && (
              <div className="space-y-3 pt-2 border-t">
                {/* Example in expanded view */}
                {result.example && (
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Example:</div>
                    <div>{result.example}</div>
                  </div>
                )}

                {/* User Notes */}
                <div>
                  <div className="font-semibold text-xs text-muted-foreground mb-2">
                    Personal Notes:
                  </div>
                  <Textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Add your own notes about this phrase..."
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Always visible at bottom */}
          <div className="px-4 pb-4 pt-3 border-t bg-card/95 backdrop-blur-md" style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('Saving with note:', userNote);
                  onSave(userNote || undefined);
                }}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save to Word Bank'}
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </>
        ) : (
          <div className="p-4 space-y-3">
            <div className="text-lg font-semibold">{phrase}</div>
            <div className="text-sm text-muted-foreground">
              No definition found for this phrase. Try selecting individual words.
            </div>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
        </Card>
      </div>
    </>,
    document.body
  );
}
