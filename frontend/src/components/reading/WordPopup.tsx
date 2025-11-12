import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { DictionaryResult } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, Pause, Check, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';

interface Profile {
  target_language?: string;
}

interface WordPopupProps {
  result: DictionaryResult;
  position: { x: number; y: number };
  onSave: (userNotes?: string) => void;
  onClose: () => void;
  saving?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  profile?: Profile | null;
  isInWordBank?: boolean;
}

export function WordPopup({ result, position, onSave, onClose, saving, onMouseEnter, onMouseLeave, profile, isInWordBank }: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [showMore, setShowMore] = useState(false);
  const [userNote, setUserNote] = useState('');
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
  }, [position]);

  const handleSpeak = async () => {
    // Determine language
    let language = 'zh-CN'; // Default to Chinese
    if (profile?.target_language === 'ja') {
      language = 'ja';
    } else if (profile?.target_language === 'zh') {
      language = 'zh-CN';
    } else if (profile?.target_language === 'ko') {
      language = 'ko-KR';
    } else {
      // Fallback: detect language from characters
      const hasHiragana = /[\u3040-\u309F]/.test(result.word);
      const hasKatakana = /[\u30A0-\u30FF]/.test(result.word);
      const hasHangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(result.word);

      if (hasHiragana || hasKatakana) {
        language = 'ja';
      } else if (hasHangul) {
        language = 'ko-KR';
      } else {
        language = 'zh-CN';
      }
    }

    setIsSpeaking(true);
    console.log('Attempting TTS for:', result.word, 'language:', language);

    try {
      // Try Web Speech API first (most reliable)
      if ('speechSynthesis' in window) {
        const success = await tryBrowserTTS(language);
        if (success) {
          return; // Success!
        }
      }

      // Fallback: Try Supabase Edge Function (bypasses CORS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        try {
          console.log('Trying Supabase Edge Function...');

          // For Japanese, prefer using reading for better pronunciation
          const textToSpeak = language === 'ja' && result.reading
            ? result.reading
            : result.word;

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
            audio.onplay = () => console.log('Supabase TTS started:', textToSpeak);
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

  /**
   * Primary TTS method using Web Speech API
   * Returns true if successful, false otherwise
   */
  const tryBrowserTTS = async (language: string): Promise<boolean> => {
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

        // Determine what text to speak
        let textToSpeak = result.word;
        let fallbackLang = language;

        // For Japanese: prefer reading (hiragana/katakana) for accurate pronunciation
        // This fixes the 私 → し issue by using わたし instead
        if (language === 'ja' && result.reading) {
          textToSpeak = result.reading;
          console.log('Using reading for Japanese pronunciation:', textToSpeak);
        } else if (!targetVoice && language === 'zh-CN' && result.reading) {
          // For Chinese without native voice, use pinyin
          textToSpeak = result.reading;
          fallbackLang = 'en-US';
          console.log('Using pinyin fallback:', textToSpeak);
        }

        if (targetVoice) {
          console.log('Using native voice:', targetVoice.name);
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = fallbackLang;
        utterance.rate = 0.8; // Slightly slower for clarity

        if (targetVoice) {
          utterance.voice = targetVoice;
        }

        utterance.onstart = () => {
          console.log('Browser TTS started:', textToSpeak);
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
      <div
        ref={popupRef}
        className="fixed max-sm:left-0 max-sm:right-0 max-sm:bottom-0"
        style={{
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          zIndex: 10001,
          isolation: 'isolate'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Pointer arrow */}
        <div
          className="absolute -top-2 left-4 w-4 h-4 backdrop-blur-md bg-card/95 border-l-2 border-t-2 border-primary/20 transform rotate-45 max-sm:hidden"
          style={{ zIndex: 10002, backgroundColor: 'hsl(var(--card) / 0.95)' }}
        />
        <Card className="w-96 max-w-[90vw] max-sm:w-full max-sm:rounded-t-lg max-sm:rounded-b-none shadow-2xl border-2 border-primary/20 animate-in fade-in duration-150 backdrop-blur-md bg-card/95" style={{ backgroundColor: 'hsl(var(--card) / 0.95)' }}>
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
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
                <div className="text-sm text-muted-foreground">{result.reading}</div>
              )}
              {isInWordBank && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                  <Check className="h-3 w-3" />
                  <span>In Word Bank</span>
                </div>
              )}
            </div>

            {/* Grammar Notes - Always visible for particles */}
            {result.grammarNotes && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-2 text-sm">
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Grammar:</div>
                <div className="text-blue-800 dark:text-blue-200">{result.grammarNotes}</div>
              </div>
            )}

            {/* Primary Definition */}
            <div className="text-sm">
              {result.formalityLevel && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground mr-2 mb-1">
                  {result.formalityLevel}
                </span>
              )}
              {result.definition}
            </div>

            {/* Character Components - Always visible for Chinese compound words */}
            {result.componentCharacters && result.componentCharacters.length > 0 && (
              <div className="rounded-md bg-secondary/60 border-2 border-primary/20 p-3 text-sm">
                <div className="font-semibold text-foreground mb-2">Character Breakdown:</div>
                <div className="space-y-2">
                  {result.componentCharacters.map((component, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xl font-bold text-foreground min-w-[1.5rem]">
                        {component.character}
                      </span>
                      <div className="flex-1">
                        <span className="text-foreground/90 font-medium">{component.reading}</span>
                        <span className="text-foreground/80 ml-2">— {component.definition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Korean Conjugation Info - Show dictionary form for conjugated verbs */}
            {result.conjugationInfo && (
              <div className="rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 p-2 text-sm">
                <div className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Conjugation:</div>
                <div className="text-purple-800 dark:text-purple-200">
                  <span className="font-medium">{result.conjugationInfo.conjugatedForm}</span>
                  <ChevronLeft className="mx-2 h-4 w-4 inline" />
                  <span className="font-medium">{result.conjugationInfo.dictionaryForm}</span>
                  {result.conjugationInfo.conjugationType && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-300">
                      ({result.conjugationInfo.conjugationType})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Korean Particle Breakdown - Show particle attached to stem */}
            {result.particleBreakdown && (
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-2 text-sm">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Particle Breakdown:</div>
                <div className="text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div>
                    <span className="font-medium">{result.particleBreakdown.stem}</span>
                    <span className="mx-1">+</span>
                    <span className="font-medium">{result.particleBreakdown.particle}</span>
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    {result.particleBreakdown.particle}: {result.particleBreakdown.particleDefinition}
                  </div>
                </div>
              </div>
            )}

            {/* Show More Button - Always visible for personal notes */}
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
                {/* Additional Definitions */}
                {result.definitions && result.definitions.length > 1 && (
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground mb-2">
                      Additional Meanings:
                    </div>
                    <div className="space-y-2">
                      {result.definitions.slice(1).map((def, idx) => (
                        <div key={idx} className="text-sm">
                          {def.partOfSpeech && (
                            <span className="text-xs text-muted-foreground italic">
                              ({def.partOfSpeech}){' '}
                            </span>
                          )}
                          {def.meaning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Notes */}
                {result.usageNotes && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-2 text-sm">
                    <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Usage:</div>
                    <div className="text-amber-800 dark:text-amber-200">{result.usageNotes}</div>
                  </div>
                )}

                {/* Examples */}
                {result.examples && result.examples.length > 0 && (
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground mb-2">
                      Examples:
                    </div>
                    <div className="space-y-1">
                      {result.examples.map((example, idx) => (
                        <div key={idx} className="rounded-md bg-muted p-2 text-xs">
                          {example}
                        </div>
                      ))}
                    </div>
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
                    placeholder="Add your own notes about this word..."
                    className="text-sm min-h-[60px]"
                  />
                </div>
              </div>
            )}

            {/* Example - backwards compatibility */}
            {result.example && !showMore && (
              <div className="rounded-md bg-muted p-2 text-sm">
                <div className="font-medium text-muted-foreground mb-1">Example:</div>
                <div>{result.example}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
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
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>,
    document.body
  );
}
