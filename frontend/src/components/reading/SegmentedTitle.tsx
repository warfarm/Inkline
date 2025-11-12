import { useState, useRef } from 'react';
import { WordPopup } from './WordPopup';
import { segmentChinese } from '@/lib/segmentation/chinese';
import { segmentJapanese } from '@/lib/segmentation/japanese';
import { segmentKorean } from '@/lib/segmentation/korean';
import { lookupChinese } from '@/lib/dictionaries/chinese';
import { lookupJapanese } from '@/lib/dictionaries/jisho';
import { lookupKorean } from '@/lib/dictionaries/korean';
import { useWordPopupMode } from '@/hooks/useWordPopupMode';
import type { DictionaryResult, Profile } from '@/types';

interface SegmentedTitleProps {
  title: string;
  language: 'zh' | 'ja' | 'ko';
  className?: string;
  profile?: Profile | null;
}

export function SegmentedTitle({ title, language, className, profile }: SegmentedTitleProps) {
  const [popup, setPopup] = useState<{ result: DictionaryResult; position: { x: number; y: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [popupHovered, setPopupHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const { mode: popupMode } = useWordPopupMode();

  // Segment the title based on language
  const segments = language === 'zh'
    ? segmentChinese(title)
    : language === 'ja'
    ? segmentJapanese(title)
    : segmentKorean(title);

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    if (loading || !word.trim()) return;

    setLoading(true);

    try {
      let result: DictionaryResult | null = null;

      if (language === 'zh') {
        result = await lookupChinese(word);
      } else if (language === 'ja') {
        result = await lookupJapanese(word);
      } else if (language === 'ko') {
        result = await lookupKorean(word);
      }

      if (result) {
        const rect = event.currentTarget.getBoundingClientRect();
        setPopup({
          result,
          position: {
            x: rect.left,
            y: rect.bottom + 5,
          },
        });
      }
    } catch (error) {
      console.error('Error looking up word:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordHover = async (word: string, event: React.MouseEvent) => {
    // If already showing this exact word, just keep it visible
    if (popup?.result.word === word) {
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

    // Set a timeout to show definition after 300ms hover
    showTimeoutRef.current = window.setTimeout(async () => {
      if (loading || !word.trim()) return;

      setLoading(true);

      try {
        let result: DictionaryResult | null = null;

        if (language === 'zh') {
          result = await lookupChinese(word);
        } else if (language === 'ja') {
          result = await lookupJapanese(word);
        } else if (language === 'ko') {
          result = await lookupKorean(word);
        }

        if (result) {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          setPopup({
            result,
            position: {
              x: rect.left,
              y: rect.bottom + 5,
            },
          });
        }
      } catch (error) {
        console.error('Error looking up word:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleWordLeave = () => {
    // Clear show timeout if user moves away before 300ms
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Set timeout to hide popup after 200ms
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (!popupHovered) {
        setPopup(null);
      }
    }, 200);
  };

  const handleClosePopup = () => {
    if (!popupHovered) {
      setPopup(null);
    }
  };

  return (
    <>
      <h1 className={className}>
        {segments.map((segment, idx) => (
          <span
            key={idx}
            className="cursor-pointer hover:bg-primary/10 transition-colors rounded px-0.5"
            onClick={popupMode === 'click' ? (e) => handleWordClick(segment.text, e) : undefined}
            onMouseEnter={popupMode === 'hover' ? (e) => handleWordHover(segment.text, e) : undefined}
            onMouseLeave={popupMode === 'hover' ? handleWordLeave : undefined}
          >
            {segment.text}
          </span>
        ))}
      </h1>

      {popup && (
        <WordPopup
          result={popup.result}
          position={popup.position}
          onSave={() => {
            // No save functionality needed for titles
            setPopup(null);
          }}
          onClose={handleClosePopup}
          profile={profile}
          onMouseEnter={() => setPopupHovered(true)}
          onMouseLeave={() => {
            setPopupHovered(false);
            handleClosePopup();
          }}
        />
      )}
    </>
  );
}
