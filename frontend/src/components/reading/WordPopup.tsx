import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { DictionaryResult } from '@/types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, Pause, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

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
  wordFuriganaVisible?: boolean;
  wordFuriganaOverridden?: boolean;
  onToggleWordFurigana?: () => void;
}

export function WordPopup({ result, position, onSave, onClose, saving, onMouseEnter, onMouseLeave, profile, isInWordBank, wordFuriganaVisible = true, wordFuriganaOverridden = false, onToggleWordFurigana }: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [showMore, setShowMore] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAbbreviations, setShowAbbreviations] = useState(false);
  const [abbreviationsOnLeft, setAbbreviationsOnLeft] = useState(false);

  // Recalculate popup position when it first appears OR when content size changes (showMore toggle)
  // Use useLayoutEffect to ensure DOM has updated before measuring
  useLayoutEffect(() => {
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
  }, [position, showMore]); // Recalculate when showMore changes

  // Check if abbreviations panel fits on the right, otherwise show on left
  useEffect(() => {
    if (showAbbreviations && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const abbreviationsPanelWidth = 256; // w-64 = 16rem = 256px

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - (rect.right + abbreviationsPanelWidth);
      const spaceOnLeft = rect.left - abbreviationsPanelWidth;

      // Position on left if not enough space on right
      setAbbreviationsOnLeft(spaceOnRight < 20 && spaceOnLeft >= 20);
    }
  }, [showAbbreviations, adjustedPosition]);

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

        // If no native voice is available, return false to try other TTS methods
        if (!targetVoice) {
          console.log(`No ${langCode} voice found. Available languages:`,
            [...new Set(voices.map(v => v.lang))].join(', '));
          console.log('Will try alternative TTS method...');
          setIsSpeaking(false);
          resolve(false);
          return;
        }

        // Determine what text to speak
        let textToSpeak = result.word;

        // For Japanese: prefer reading (hiragana/katakana) for accurate pronunciation
        // This fixes the 私 → し issue by using わたし instead
        if (language === 'ja' && result.reading) {
          textToSpeak = result.reading;
          console.log('Using reading for Japanese pronunciation:', textToSpeak);
        }

        console.log('Using native voice:', targetVoice.name);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language;
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.voice = targetVoice;

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
          isolation: 'isolate',
          animation: 'popupAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Pointer arrow */}
        <div
          className="absolute -top-2 left-4 w-4 h-4 backdrop-blur-md bg-card/95 border-l-2 border-t-2 border-primary/20 transform rotate-45 max-sm:hidden"
          style={{ zIndex: 10002, backgroundColor: 'hsl(var(--card) / 0.95)' }}
        />

        {/* Abbreviations Panel - Left Side */}
        {showAbbreviations && abbreviationsOnLeft && (
          <Card
            className="absolute right-full mr-0 w-64 shadow-2xl border-2 border-primary/20 backdrop-blur-md bg-card/95 max-sm:hidden"
            style={{ backgroundColor: 'hsl(var(--card) / 0.95)', maxHeight: '70vh', overflow: 'auto', top: 0, animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="p-4 space-y-3">
              <div className="font-bold text-base border-b border-border pb-2">
                Abbreviation Guide
              </div>

              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-muted-foreground">Parts of Speech:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">n</span> - noun</div>
                    <div><span className="font-mono text-primary">v</span> - verb</div>
                    <div><span className="font-mono text-primary">vt</span> - transitive verb</div>
                    <div><span className="font-mono text-primary">vi</span> - intransitive verb</div>
                    <div><span className="font-mono text-primary">vs</span> - suru verb</div>
                    <div><span className="font-mono text-primary">adj</span> - adjective</div>
                    <div><span className="font-mono text-primary">adj-i</span> - i-adjective</div>
                    <div><span className="font-mono text-primary">adj-na</span> - na-adjective</div>
                    <div><span className="font-mono text-primary">adv</span> - adverb</div>
                    <div><span className="font-mono text-primary">prt</span> - particle</div>
                    <div><span className="font-mono text-primary">conj</span> - conjunction</div>
                    <div><span className="font-mono text-primary">pron</span> - pronoun</div>
                    <div><span className="font-mono text-primary">aux</span> - auxiliary</div>
                    <div><span className="font-mono text-primary">int</span> - interjection</div>
                    <div><span className="font-mono text-primary">ctr</span> - counter</div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="font-semibold text-xs text-muted-foreground">Common Combinations:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">n, vs</span> - noun (suru verb)</div>
                    <div><span className="font-mono text-primary">n, vt, vi</span> - noun/verb forms</div>
                    <div><span className="font-mono text-primary">adj-i, adj-na</span> - both adjective types</div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="font-semibold text-xs text-muted-foreground">Other:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">()</span> - part of speech marker</div>
                    <div><span className="font-mono text-primary">•</span> - multiple definitions</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Main Card */}
        <div className="relative inline-block">
          {/* Abbreviations Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAbbreviations(!showAbbreviations)}
            className={`absolute ${abbreviationsOnLeft && showAbbreviations ? '-left-2' : '-right-2'} top-1/2 -translate-y-1/2 z-[10003] h-8 w-8 p-0 rounded-full bg-card/95 border-2 border-primary/20 hover:bg-primary/10 transition-all hover:scale-110`}
            title="Toggle abbreviations guide"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${showAbbreviations ? (abbreviationsOnLeft ? '' : 'rotate-180') : (abbreviationsOnLeft ? 'rotate-180' : '')}`} />
          </Button>

          <Card className="w-96 max-w-[90vw] max-sm:w-full max-sm:rounded-t-lg max-sm:rounded-b-none shadow-2xl border-2 border-primary/20 backdrop-blur-md bg-card/95" style={{ backgroundColor: 'hsl(var(--card) / 0.95)', maxHeight: '70vh', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto' }}>
          <div className={`p-4 ${showMore ? 'pb-8' : 'pb-4'} space-y-3 overflow-y-auto`} style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
            {/* Header with Reading Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
                {/* Furigana Toggle (for Japanese) - Controls this word's furigana */}
                {result.reading && onToggleWordFurigana && profile?.target_language === 'ja' && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 border border-border">
                    <Label htmlFor="furigana-toggle" className="text-xs font-medium cursor-pointer flex items-center gap-1" title={`Toggle furigana for this word${wordFuriganaOverridden ? ' (overridden)' : ''}`}>
                      {wordFuriganaVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span className="hidden sm:inline">Furigana</span>
                    </Label>
                    <Switch
                      id="furigana-toggle"
                      checked={wordFuriganaVisible}
                      onCheckedChange={onToggleWordFurigana}
                    />
                  </div>
                )}
              </div>
              {result.reading && (
                <div className="text-sm text-muted-foreground">{result.reading}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {/* JLPT Level Badge */}
                {result.jlptLevel && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-600 dark:bg-blue-900/80 text-white dark:text-blue-200 border border-blue-700 dark:border-blue-700">
                    <span className="font-bold">JLPT N{result.jlptLevel}</span>
                  </div>
                )}
                {/* Grammar Particle Badge */}
                {result.definitions?.some(def => {
                  const pos = def.partOfSpeech?.toLowerCase() || '';
                  return pos.includes('particle') || pos.includes('prt');
                }) && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-600 dark:bg-purple-900/30 text-white dark:text-purple-200 border border-purple-700 dark:border-purple-700">
                    <span className="font-bold">文法</span>
                    <span>Grammar Particle</span>
                  </div>
                )}
                {/* Word Bank Badge */}
                {isInWordBank && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-600 dark:bg-green-900/30 text-white dark:text-green-200 border border-green-700 dark:border-green-700">
                    <Check className="h-3 w-3" />
                    <span>In Word Bank</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grammar Notes - Always visible for particles */}
            {result.grammarNotes && (
              <div className="rounded-md bg-muted/80 border-2 border-primary/30 p-3 text-sm backdrop-blur-sm">
                <div className="font-semibold text-foreground mb-1.5 text-base">Grammar:</div>
                <div className="text-foreground/95 leading-relaxed">{result.grammarNotes}</div>
              </div>
            )}

            {/* Primary Definition */}
            <div className="text-sm space-y-2">
              {result.formalityLevel && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground mr-2 mb-1">
                  {result.formalityLevel}
                </span>
              )}
              {/* Show definitions as a list if there are multiple, otherwise show as text */}
              {result.definitions && result.definitions.length > 0 ? (
                <div className="space-y-1.5">
                  {result.definitions.slice(0, 3).map((def, idx) => {
                    const showBullet = result.definitions && result.definitions.length > 1;
                    return (
                      <div key={idx} className="flex gap-2">
                        {showBullet && (
                          <span className="text-muted-foreground font-medium">•</span>
                        )}
                        <div>
                          {def.partOfSpeech && (
                            <span className="text-xs text-muted-foreground italic">
                              ({def.partOfSpeech}){' '}
                            </span>
                          )}
                          <span>{def.meaning}</span>
                        </div>
                      </div>
                    );
                  })}
                  {result.definitions.length > 3 && (
                    <div className="text-xs text-muted-foreground italic">
                      + {result.definitions.length - 3} more meanings (click "Show More")
                    </div>
                  )}
                </div>
              ) : (
                <div>{result.definition}</div>
              )}
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
                {/* Additional Definitions - Show definitions beyond the first 3 */}
                {result.definitions && result.definitions.length > 3 && (
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground mb-2">
                      Additional Meanings:
                    </div>
                    <div className="space-y-2">
                      {result.definitions.slice(3).map((def, idx) => (
                        <div key={idx} className="text-sm flex gap-2">
                          <span className="text-muted-foreground font-medium">•</span>
                          <div>
                            {def.partOfSpeech && (
                              <span className="text-xs text-muted-foreground italic">
                                ({def.partOfSpeech}){' '}
                              </span>
                            )}
                            {def.meaning}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Notes */}
                {result.usageNotes && (
                  <div className="rounded-md bg-muted/80 border-2 border-primary/30 p-3 text-sm backdrop-blur-sm">
                    <div className="font-semibold text-foreground mb-1.5 text-base">Usage:</div>
                    <div className="text-foreground/95 leading-relaxed">{result.usageNotes}</div>
                  </div>
                )}

                {/* Examples */}
                {result.examples && result.examples.length > 0 && (
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground mb-2">
                      Examples:
                    </div>
                    <div className="space-y-2">
                      {result.examples.map((example, idx) => {
                        const lines = example.split('\n');
                        const japanese = lines[0] || '';
                        const english = lines[1] || '';
                        return (
                          <div key={idx} className="rounded-md bg-muted/80 border border-primary/10 p-2 text-sm">
                            <div className="font-medium text-foreground mb-1">{japanese}</div>
                            <div className="text-muted-foreground text-xs">{english}</div>
                          </div>
                        );
                      })}
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
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
        </div>

        {/* Abbreviations Panel - Right Side */}
        {showAbbreviations && !abbreviationsOnLeft && (
          <Card
            className="absolute left-full ml-0 w-64 shadow-2xl border-2 border-primary/20 backdrop-blur-md bg-card/95 max-sm:hidden"
            style={{ backgroundColor: 'hsl(var(--card) / 0.95)', maxHeight: '70vh', overflow: 'auto', top: 0, animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="p-4 space-y-3">
              <div className="font-bold text-base border-b border-border pb-2">
                Abbreviation Guide
              </div>

              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-muted-foreground">Parts of Speech:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">n</span> - noun</div>
                    <div><span className="font-mono text-primary">v</span> - verb</div>
                    <div><span className="font-mono text-primary">vt</span> - transitive verb</div>
                    <div><span className="font-mono text-primary">vi</span> - intransitive verb</div>
                    <div><span className="font-mono text-primary">vs</span> - suru verb</div>
                    <div><span className="font-mono text-primary">adj</span> - adjective</div>
                    <div><span className="font-mono text-primary">adj-i</span> - i-adjective</div>
                    <div><span className="font-mono text-primary">adj-na</span> - na-adjective</div>
                    <div><span className="font-mono text-primary">adv</span> - adverb</div>
                    <div><span className="font-mono text-primary">prt</span> - particle</div>
                    <div><span className="font-mono text-primary">conj</span> - conjunction</div>
                    <div><span className="font-mono text-primary">pron</span> - pronoun</div>
                    <div><span className="font-mono text-primary">aux</span> - auxiliary</div>
                    <div><span className="font-mono text-primary">int</span> - interjection</div>
                    <div><span className="font-mono text-primary">ctr</span> - counter</div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="font-semibold text-xs text-muted-foreground">Common Combinations:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">n, vs</span> - noun (suru verb)</div>
                    <div><span className="font-mono text-primary">n, vt, vi</span> - noun/verb forms</div>
                    <div><span className="font-mono text-primary">adj-i, adj-na</span> - both adjective types</div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="font-semibold text-xs text-muted-foreground">Other:</div>
                  <div className="space-y-0.5 text-xs">
                    <div><span className="font-mono text-primary">()</span> - part of speech marker</div>
                    <div><span className="font-mono text-primary">•</span> - multiple definitions</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>,
    document.body
  );
}
