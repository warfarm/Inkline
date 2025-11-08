import { hasKanji, isKanji } from '@/lib/segmentation';

interface FuriganaTextProps {
  text: string;
  reading?: string;
  showFurigana: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function FuriganaText({ text, reading, showFurigana, onClick, className }: FuriganaTextProps) {
  const containsKanji = hasKanji(text);

  // If no kanji or no reading, just render the text normally
  if (!containsKanji || !reading || !showFurigana) {
    return (
      <span className={className} onClick={onClick}>
        {text}
      </span>
    );
  }

  // Simple furigana rendering
  // In production, you'd want more sophisticated furigana placement
  return (
    <ruby className={className} onClick={onClick}>
      {text}
      <rt className="text-xs">{reading}</rt>
    </ruby>
  );
}

/**
 * Renders text with furigana for kanji characters based on familiarity
 * @param text - The text to render
 * @param reading - The reading (furigana) for the text
 * @param shouldShowFurigana - Function to determine if furigana should be shown for a character
 * @param onClick - Click handler
 * @param className - CSS classes
 */
interface SmartFuriganaTextProps {
  text: string;
  reading?: string;
  shouldShowFurigana: (char: string) => boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function SmartFuriganaText({
  text,
  reading,
  shouldShowFurigana,
  onClick,
  className,
}: SmartFuriganaTextProps) {
  // If no reading provided, render normally
  if (!reading) {
    return (
      <span className={className} onClick={onClick}>
        {text}
      </span>
    );
  }

  // Check each character and show furigana based on familiarity
  const chars = Array.from(text);
  const hasAnyKanji = chars.some((char) => isKanji(char));

  if (!hasAnyKanji) {
    return (
      <span className={className} onClick={onClick}>
        {text}
      </span>
    );
  }

  // Determine if we should show furigana for the whole word
  // If any kanji in the word needs furigana, show it for the whole word
  const needsFurigana = chars.some((char) => isKanji(char) && shouldShowFurigana(char));

  if (needsFurigana) {
    return (
      <ruby className={className} onClick={onClick}>
        {text}
        <rt className="text-xs">{reading}</rt>
      </ruby>
    );
  }

  return (
    <span className={className} onClick={onClick}>
      {text}
    </span>
  );
}
