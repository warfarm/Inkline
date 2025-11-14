import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X, Upload, Palette } from 'lucide-react';
import type { WordSet, Language, WordSetPracticeSettings } from '@/types';

interface CreateSetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (setData: Partial<WordSet>) => Promise<void>;
  editingSet?: WordSet | null;
  userLanguage: Language;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const DEFAULT_COVER_IMAGES = [
  { id: 'default-chinese', emoji: '📚', label: 'Books' },
  { id: 'default-japanese', emoji: '🎌', label: 'Japanese Flag' },
  { id: 'default-korean', emoji: '🇰🇷', label: 'Korean Flag' },
  { id: 'default-study', emoji: '✏️', label: 'Pencil' },
  { id: 'default-brain', emoji: '🧠', label: 'Brain' },
  { id: 'default-star', emoji: '⭐', label: 'Star' },
  { id: 'default-rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'default-trophy', emoji: '🏆', label: 'Trophy' },
];

export function CreateSetModal({
  open,
  onClose,
  onSave,
  editingSet,
  userLanguage,
}: CreateSetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<Language>(userLanguage);
  const [color, setColor] = useState('#3B82F6');
  const [coverImage, setCoverImage] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#3B82F6');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Practice settings
  const [cardsPerSession, setCardsPerSession] = useState<number | 'all'>('all');
  const [shuffle, setShuffle] = useState(false);
  const [showReading, setShowReading] = useState<'always' | 'onReveal' | 'never'>('always');

  useEffect(() => {
    if (editingSet) {
      setName(editingSet.name);
      setDescription(editingSet.description || '');
      setLanguage(editingSet.language);
      setColor(editingSet.color);
      setCoverImage(editingSet.cover_image_url || '');
      setCardsPerSession(editingSet.practice_settings.cardsPerSession);
      setShuffle(editingSet.practice_settings.shuffle);
      setShowReading(editingSet.practice_settings.showReading);
    } else {
      // Reset for new set
      setName('');
      setDescription('');
      setLanguage(userLanguage);
      setColor('#3B82F6');
      setCoverImage('');
      setTags([]);
      setCardsPerSession('all');
      setShuffle(false);
      setShowReading('always');
    }
  }, [editingSet, open, userLanguage]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be less than 8MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    setUploadingImage(true);
    try {
      // TODO: Upload to Supabase Storage
      // For now, we'll use a data URL as a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleSelectDefaultCover = (emoji: string) => {
    setCoverImage(`emoji:${emoji}`);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a set name');
      return;
    }

    setSaving(true);
    try {
      const practiceSettings: WordSetPracticeSettings = {
        cardsPerSession,
        shuffle,
        showReading,
      };

      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        color,
        cover_image_url: coverImage || undefined,
        practice_settings: practiceSettings,
      });

      onClose();
    } catch (error) {
      console.error('Error saving set:', error);
      toast.error('Failed to save set');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSet ? 'Edit Set' : 'Create New Set'}</DialogTitle>
          <DialogDescription>
            {editingSet ? 'Update your set details' : 'Create a new word set to organize your vocabulary'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Set Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HSK 3 Vocabulary"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this set..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
                disabled={!!editingSet} // Can't change language of existing set
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">Chinese (中文)</SelectItem>
                  <SelectItem value="ja">Japanese (日本語)</SelectItem>
                  <SelectItem value="ko">Korean (한국어)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DEFAULT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-10 h-10 rounded-md transition-transform ${
                    color === colorOption ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={colorOption}
                />
              ))}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-10 h-10 rounded-md border-2 border-dashed border-muted-foreground hover:border-foreground transition-colors flex items-center justify-center"
                title="Custom color"
              >
                <Palette className="h-5 w-5" />
              </button>
            </div>
            {showColorPicker && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setColor(e.target.value);
                  }}
                  className="h-10 w-20"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            <div className="space-y-3 mt-2">
              {/* Default covers */}
              <div className="grid grid-cols-8 gap-2">
                {DEFAULT_COVER_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectDefaultCover(img.emoji)}
                    className={`aspect-square text-3xl flex items-center justify-center rounded-md border-2 transition-all ${
                      coverImage === `emoji:${img.emoji}`
                        ? 'border-primary bg-primary/10 scale-110'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    title={img.label}
                  >
                    {img.emoji}
                  </button>
                ))}
              </div>

              {/* Custom upload */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="cover-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Custom Image'}
                </Label>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <span className="text-xs text-muted-foreground">Max 8MB</span>
              </div>

              {/* Preview */}
              {coverImage && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border">
                  {coverImage.startsWith('emoji:') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-6xl">
                      {coverImage.replace('emoji:', '')}
                    </div>
                  ) : (
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                maxLength={30}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Practice Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Practice Settings</h4>

            <div>
              <Label htmlFor="cards-per-session">Cards Per Session</Label>
              <Select
                value={cardsPerSession.toString()}
                onValueChange={(value) => setCardsPerSession(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger id="cards-per-session" className="mt-1">
                  <SelectValue placeholder="Select cards per session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 cards</SelectItem>
                  <SelectItem value="20">20 cards</SelectItem>
                  <SelectItem value="50">50 cards</SelectItem>
                  <SelectItem value="all">All cards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">Shuffle Cards</Label>
              <input
                id="shuffle"
                type="checkbox"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div>
              <Label htmlFor="show-reading">Show Reading</Label>
              <Select
                value={showReading}
                onValueChange={(value) => setShowReading(value as 'always' | 'onReveal' | 'never')}
              >
                <SelectTrigger id="show-reading" className="mt-1">
                  <SelectValue placeholder="Select reading display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always show</SelectItem>
                  <SelectItem value="onReveal">Show on card flip</SelectItem>
                  <SelectItem value="never">Never show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingSet ? 'Save Changes' : 'Create Set'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
