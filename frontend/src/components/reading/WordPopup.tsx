import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { DictionaryResult } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface WordPopupProps {
  result: DictionaryResult;
  position: { x: number; y: number };
  onSave: (userNotes?: string) => void;
  onClose: () => void;
  saving?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function WordPopup({ result, position, onSave, onClose, saving, onMouseEnter, onMouseLeave }: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
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
  }, [position]);

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
        <Card className="w-96 max-w-[90vw] max-sm:w-full max-sm:rounded-t-lg max-sm:rounded-b-none shadow-2xl border-2 border-primary/20 bg-white max-h-[80vh] overflow-y-auto">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <div className="text-2xl font-bold">{result.word}</div>
              {result.reading && (
                <div className="text-sm text-muted-foreground">{result.reading}</div>
              )}
            </div>

            {/* Grammar Notes - Always visible for particles */}
            {result.grammarNotes && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-sm">
                <div className="font-semibold text-blue-900 mb-1">Grammar:</div>
                <div className="text-blue-800">{result.grammarNotes}</div>
              </div>
            )}

            {/* Primary Definition */}
            <div className="text-sm">
              {result.formalityLevel && (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 mr-2 mb-1">
                  {result.formalityLevel}
                </span>
              )}
              {result.definition}
            </div>

            {/* Show More Button */}
            {(result.definitions && result.definitions.length > 1) || result.usageNotes || result.examples ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMore(!showMore)}
                className="w-full text-xs"
              >
                {showMore ? '▲ Show Less' : '▼ Show More'}
              </Button>
            ) : null}

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
                  <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-sm">
                    <div className="font-semibold text-amber-900 mb-1">Usage:</div>
                    <div className="text-amber-800">{result.usageNotes}</div>
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
