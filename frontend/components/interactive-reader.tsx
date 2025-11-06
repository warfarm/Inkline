"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/lib/types";

interface InteractiveReaderProps {
    text: string;
    language: Language;
    className?: string;
}

/**
 * Splits text into logical word units based on language
 */
function splitTextByLanguage(text: string, language: Language): string[] {
    // Character-based languages (each character is a word)
    if (language === Language.Chinese || language === Language.Japanese) {
        return text.split("");
    }

    // For Korean, it's mixed - has spaces but also character-based aspects
    if (language === Language.Korean) {
        // Split by character for now, can refine later
        return text.split("");
    }

    // Space-based languages (split by whitespace, preserve punctuation attached to words)
    // Matches words with optional attached punctuation
    const words = text.match(/\S+|\s+/g) || [];
    return words;
}

export function InteractiveReader({
    text,
    language,
    className = "",
}: InteractiveReaderProps) {
    const words = splitTextByLanguage(text, language);
    const [popup, setPopup] = useState<{ word: string; x: number; y: number } | null>(null);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleWordEnter = (word: string, e: React.MouseEvent) => {
        // Clear any existing timeout
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }

        // Start new timeout
        hoverTimeout.current = setTimeout(() => {
            setPopup({
                word,
                x: e.clientX,
                y: e.clientY,
            });
        }, 500);
    };

    const handleWordLeave = () => {
        // Clear timeout if mouse leaves before 500ms
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
        setPopup(null);
    };

    return (
        <>
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="leading-relaxed">
                        {words.map((word, index) => (
                            <span
                                key={index}
                                className="hover:bg-accent hover:text-accent-foreground cursor-text transition-colors"
                                onMouseEnter={(e) => handleWordEnter(word, e)}
                                onMouseLeave={handleWordLeave}
                            >
                                {word}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {popup && (
                <Card
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: popup.x + 10,
                        top: popup.y + 10,
                    }}
                >
                    <CardContent className="p-3">
                        <div className="text-sm">{popup.word}</div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
