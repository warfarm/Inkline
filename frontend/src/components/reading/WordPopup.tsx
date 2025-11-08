import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DictionaryResult } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface WordPopupProps {
  result: DictionaryResult;
  position: { x: number; y: number };
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
}

export function WordPopup({ result, position, onSave, onClose, saving }: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

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
          isolation: 'isolate'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-80 max-sm:w-full max-sm:rounded-t-lg max-sm:rounded-b-none shadow-2xl border-2 border-primary/20 bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{result.word}</div>
              {result.reading && (
                <div className="text-sm text-muted-foreground">{result.reading}</div>
              )}
            </div>

            <div className="text-sm">{result.definition}</div>

            {result.example && (
              <div className="rounded-md bg-muted p-2 text-sm">
                <div className="font-medium text-muted-foreground mb-1">Example:</div>
                <div>{result.example}</div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={onSave} disabled={saving} className="flex-1">
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
