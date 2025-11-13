import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { lookupJapanese } from '@/lib/dictionaries/jmdict';
import { lookupChinese } from '@/lib/dictionaries/chinese';
import { lookupKorean } from '@/lib/dictionaries/korean';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';
import type { Language, DictionaryResult } from '@/types';

interface FuzzyMatch {
  word: string;
  reading?: string;
  definition: string;
  fullResult: DictionaryResult;
}

interface AddWordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddWordForm({ onSuccess, onCancel }: AddWordFormProps) {
  const { user, profile } = useAuth();
  const [language, setLanguage] = useState<Language>(profile?.target_language || 'ja');
  const [searchQuery, setSearchQuery] = useState('');
  const [fuzzyMatches, setFuzzyMatches] = useState<FuzzyMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<FuzzyMatch | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [languageMismatch, setLanguageMismatch] = useState<string | null>(null);
  const [selectionWarning, setSelectionWarning] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    reading: '',
    example_sentence: '',
    grammar_notes: '',
    usage_notes: '',
    formality_level: '' as '' | 'casual' | 'polite' | 'formal',
    user_notes: '',
  });

  const searchTimeoutRef = useRef<number | null>(null);
  const duplicateTimeoutRef = useRef<number | null>(null);

  // Detect character script for language mismatch warning
  const detectLanguage = (text: string): Language | null => {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // Hiragana/Katakana
    if (/[\u4E00-\u9FFF]/.test(text)) {
      // CJK characters - could be Chinese or Japanese
      // If it contains hiragana/katakana, it's Japanese
      if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
      // Otherwise assume Chinese (we can't perfectly distinguish)
      return 'zh';
    }
    if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text)) return 'ko'; // Hangul
    return null;
  };

  // Check for duplicates
  const checkDuplicate = async (word: string, lang: Language) => {
    if (!word || !user) return;

    if (duplicateTimeoutRef.current) {
      clearTimeout(duplicateTimeoutRef.current);
    }

    duplicateTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('word_bank')
          .select('id')
          .eq('user_id', user.id)
          .eq('word', word)
          .eq('language', lang)
          .maybeSingle();

        if (error) throw error;
        setIsDuplicate(!!data);
      } catch (error) {
        console.error('Error checking duplicate:', error);
      }
    }, 300);
  };

  // Fuzzy search implementation
  const fuzzySearch = async (query: string, lang: Language): Promise<FuzzyMatch[]> => {
    if (!query.trim()) return [];

    const matches: FuzzyMatch[] = [];
    const maxMatches = 5;

    try {
      if (lang === 'ja') {
        const { basicJapaneseDict } = await import('@/lib/dictionaries/jmdict');

        // Search by exact match first, then partial matches
        for (const [key, entry] of Object.entries(basicJapaneseDict)) {
          if (matches.length >= maxMatches) break;

          // Exact match
          if (key === query) {
            const result = await lookupJapanese(key);
            if (result) {
              matches.push({
                word: key,
                reading: entry.reading,
                definition: entry.senses[0].gloss.join(', '),
                fullResult: result,
              });
            }
          }
        }

        // If no exact match, find partial matches
        if (matches.length === 0) {
          for (const [key, entry] of Object.entries(basicJapaneseDict)) {
            if (matches.length >= maxMatches) break;

            // Partial match (kanji or kana)
            if (key.includes(query) || entry.reading.includes(query)) {
              const result = await lookupJapanese(key);
              if (result) {
                matches.push({
                  word: key,
                  reading: entry.reading,
                  definition: entry.senses[0].gloss.join(', '),
                  fullResult: result,
                });
              }
            }
          }
        }
      } else if (lang === 'zh') {
        const { basicChineseDict } = await import('@/lib/dictionaries/chinese');

        // Exact match first
        for (const [key, entry] of Object.entries(basicChineseDict)) {
          if (matches.length >= maxMatches) break;

          if (key === query) {
            const result = await lookupChinese(key);
            if (result) {
              matches.push({
                word: key,
                reading: entry.pinyin,
                definition: entry.definition,
                fullResult: result,
              });
            }
          }
        }

        // Partial matches
        if (matches.length === 0) {
          for (const [key, entry] of Object.entries(basicChineseDict)) {
            if (matches.length >= maxMatches) break;

            // Match by hanzi or pinyin
            if (key.includes(query) || entry.pinyin.toLowerCase().includes(query.toLowerCase())) {
              const result = await lookupChinese(key);
              if (result) {
                matches.push({
                  word: key,
                  reading: entry.pinyin,
                  definition: entry.definition,
                  fullResult: result,
                });
              }
            }
          }
        }
      } else if (lang === 'ko') {
        // For Korean, we'll try to lookup the word directly and if it fails, we won't show matches
        const result = await lookupKorean(query);
        if (result) {
          matches.push({
            word: query,
            reading: result.reading || '',
            definition: result.definition,
            fullResult: result,
          });
        }
      }
    } catch (error) {
      console.error('Error in fuzzy search:', error);
      toast.error('Failed to search dictionary');
    }

    return matches;
  };

  // Handle search query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setFuzzyMatches([]);
      setHasSearched(false);
      setLanguageMismatch(null);
      return;
    }

    // Check language mismatch
    const detectedLang = detectLanguage(searchQuery);
    if (detectedLang && detectedLang !== language) {
      const langNames = { ja: 'Japanese', zh: 'Chinese', ko: 'Korean' };
      setLanguageMismatch(
        `This looks like ${langNames[detectedLang]}, but you have ${langNames[language]} selected.`
      );
    } else {
      setLanguageMismatch(null);
    }

    // Check for duplicates
    checkDuplicate(searchQuery, language);

    // Perform fuzzy search after debounce
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      setHasSearched(true);
      const matches = await fuzzySearch(searchQuery, language);
      setFuzzyMatches(matches);
      setSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, language]);

  // Handle fuzzy match selection
  const handleSelectMatch = (match: FuzzyMatch) => {
    setSelectedMatch(match);
    setShowManualEntry(true);
    setSelectionWarning(false);

    // Auto-fill form with dictionary data
    // Filter formality level to only include valid values for word_bank
    const formalityLevel = match.fullResult.formalityLevel;
    const validFormalityLevel = (formalityLevel === 'casual' || formalityLevel === 'polite' || formalityLevel === 'formal')
      ? formalityLevel
      : '';

    setFormData({
      word: match.word,
      definition: match.fullResult.definition,
      reading: match.fullResult.reading || '',
      example_sentence: match.fullResult.example || (match.fullResult.examples?.[0] || ''),
      grammar_notes: match.fullResult.grammarNotes || '',
      usage_notes: match.fullResult.usageNotes || '',
      formality_level: validFormalityLevel,
      user_notes: '',
    });
  };

  // Handle manual entry
  const handleManualEntry = () => {
    setShowManualEntry(true);
    setSelectedMatch(null);
    setSelectionWarning(false);

    // Pre-fill word from search query
    setFormData({
      word: searchQuery,
      definition: '',
      reading: '',
      example_sentence: '',
      grammar_notes: '',
      usage_notes: '',
      formality_level: '',
      user_notes: '',
    });
  };

  // Handle search again
  const handleSearchAgain = () => {
    if (formData.word) {
      setSelectionWarning(false);
      setSelectedMatch(null);
      setShowManualEntry(false);
      setFormData({
        word: '',
        definition: '',
        reading: '',
        example_sentence: '',
        grammar_notes: '',
        usage_notes: '',
        formality_level: '',
        user_notes: '',
      });
    }
  };

  // Handle search input change when form is populated
  const handleSearchInputChange = (value: string) => {
    if ((selectedMatch || showManualEntry) && formData.word) {
      setSelectionWarning(true);
    }
    setSearchQuery(value);
  };

  // Confirm search again
  const confirmSearchAgain = () => {
    setSelectionWarning(false);
    setSelectedMatch(null);
    setShowManualEntry(false);
    setFormData({
      word: '',
      definition: '',
      reading: '',
      example_sentence: '',
      grammar_notes: '',
      usage_notes: '',
      formality_level: '',
      user_notes: '',
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!user || !formData.word || !formData.definition) {
      toast.error('Please fill in required fields (word and definition)');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('word_bank').insert({
        user_id: user.id,
        word: formData.word,
        language,
        definition: formData.definition,
        reading: formData.reading || null,
        example_sentence: formData.example_sentence || null,
        grammar_notes: formData.grammar_notes || null,
        usage_notes: formData.usage_notes || null,
        formality_level: formData.formality_level || null,
        user_notes: formData.user_notes || null,
        additional_definitions: selectedMatch?.fullResult.definitions
          ? JSON.stringify(selectedMatch.fullResult.definitions)
          : null,
        status: 'learning',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Word already exists in your word bank');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Word added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error saving word:', error);
      toast.error('Failed to save word. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Language</CardTitle>
          <CardDescription>Choose the language of the word you want to add</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={language === 'ja' ? 'default' : 'outline'}
              onClick={() => setLanguage('ja')}
              disabled={selectedMatch !== null || showManualEntry}
            >
              Japanese
            </Button>
            <Button
              variant={language === 'zh' ? 'default' : 'outline'}
              onClick={() => setLanguage('zh')}
              disabled={selectedMatch !== null || showManualEntry}
            >
              Chinese
            </Button>
            <Button
              variant={language === 'ko' ? 'default' : 'outline'}
              onClick={() => setLanguage('ko')}
              disabled={selectedMatch !== null || showManualEntry}
            >
              Korean
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle>Search for Word</CardTitle>
          <CardDescription>Type a word to search in the dictionary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder={`Enter ${language === 'ja' ? 'Japanese' : language === 'zh' ? 'Chinese' : 'Korean'} word...`}
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            disabled={saving}
          />

          {/* Selection Warning */}
          {selectionWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  You'll lose your current selection
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Starting a new search will clear the form. Are you sure?
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={confirmSearchAgain}>
                    Yes, search again
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectionWarning(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Language Mismatch Warning */}
          {languageMismatch && !selectionWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">{languageMismatch}</p>
            </div>
          )}

          {/* Duplicate Warning */}
          {isDuplicate && !selectionWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <p className="text-sm text-orange-800 dark:text-orange-200">
                This word is already in your word bank
              </p>
            </div>
          )}

          {/* Loading State */}
          {searching && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching dictionary...</span>
            </div>
          )}

          {/* Selected Match Display */}
          {selectedMatch && !selectionWarning && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Selected: {selectedMatch.word}
                    {selectedMatch.reading && ` (${selectedMatch.reading})`}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {selectedMatch.definition}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSearchAgain}
                className="mt-2"
              >
                Search again
              </Button>
            </div>
          )}

          {/* Fuzzy Matches */}
          {!searching && !selectedMatch && hasSearched && fuzzyMatches.length > 0 && !selectionWarning && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Found {fuzzyMatches.length} match{fuzzyMatches.length > 1 ? 'es' : ''}:
              </p>
              {fuzzyMatches.map((match, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSelectMatch(match)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium text-lg">
                      {match.word}
                      {match.reading && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({match.reading})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{match.definition}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Matches Found */}
          {!searching && hasSearched && fuzzyMatches.length === 0 && !selectedMatch && !selectionWarning && (
            <div className="text-center p-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                No matches found in the dictionary
              </p>
              <Button onClick={handleManualEntry} variant="outline">
                Enter Manually
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      {showManualEntry && !selectionWarning && (
        <Card>
          <CardHeader>
            <CardTitle>Word Details</CardTitle>
            <CardDescription>
              {selectedMatch ? 'Review and edit the word information' : 'Enter word information manually'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Required Fields */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Word <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                placeholder="Enter word"
                disabled={saving}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Definition <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.definition}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                placeholder="Enter definition"
                className="min-h-[80px]"
                disabled={saving}
              />
            </div>

            {/* Reading field (shown for Japanese and Chinese) */}
            {(language === 'ja' || language === 'zh') && (
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Reading / Pronunciation {language === 'ja' && <span className="text-muted-foreground text-xs">(recommended)</span>}
                </label>
                <Input
                  type="text"
                  value={formData.reading}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  placeholder={language === 'ja' ? 'Hiragana reading' : 'Pinyin'}
                  disabled={saving}
                />
              </div>
            )}

            {/* Add More Details Toggle */}
            <Button
              variant="ghost"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="w-full"
            >
              {showAdvancedFields ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Additional Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Add More Details
                </>
              )}
            </Button>

            {/* Advanced Fields */}
            {showAdvancedFields && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Example Sentence</label>
                  <Textarea
                    value={formData.example_sentence}
                    onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
                    placeholder="Enter an example sentence"
                    className="min-h-[60px]"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Grammar Notes</label>
                  <Textarea
                    value={formData.grammar_notes}
                    onChange={(e) => setFormData({ ...formData, grammar_notes: e.target.value })}
                    placeholder="Enter grammar notes"
                    className="min-h-[60px]"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Usage Notes</label>
                  <Textarea
                    value={formData.usage_notes}
                    onChange={(e) => setFormData({ ...formData, usage_notes: e.target.value })}
                    placeholder="Enter usage notes"
                    className="min-h-[60px]"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Formality Level</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={formData.formality_level === 'casual' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, formality_level: 'casual' })}
                      disabled={saving}
                    >
                      Casual
                    </Button>
                    <Button
                      size="sm"
                      variant={formData.formality_level === 'polite' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, formality_level: 'polite' })}
                      disabled={saving}
                    >
                      Polite
                    </Button>
                    <Button
                      size="sm"
                      variant={formData.formality_level === 'formal' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, formality_level: 'formal' })}
                      disabled={saving}
                    >
                      Formal
                    </Button>
                    <Button
                      size="sm"
                      variant={!formData.formality_level ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, formality_level: '' })}
                      disabled={saving}
                    >
                      None
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Personal Notes</label>
                  <Textarea
                    value={formData.user_notes}
                    onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
                    placeholder="Add your personal notes, mnemonics, or reminders"
                    className="min-h-[80px]"
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!formData.word || !formData.definition || saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add to Word Bank'
                )}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
