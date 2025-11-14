import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Copy,
  Star,
  StarOff,
  BookOpen,
} from 'lucide-react';
import type { WordSet, WordSetTag } from '@/types';

interface SetCardProps {
  set: WordSet;
  tags?: WordSetTag[];
  onEdit: (set: WordSet) => void;
  onDelete: (setId: string) => void;
  onShare: (set: WordSet) => void;
  onCopy: (setId: string) => void;
  onToggleFavorite: (setId: string, isFavorite: boolean) => void;
  onPractice: (set: WordSet) => void;
  onClick?: (set: WordSet) => void;
  isReference?: boolean; // True if this is a shared/copied set reference
}

export function SetCard({
  set,
  tags = [],
  onEdit,
  onDelete,
  onShare,
  onCopy,
  onToggleFavorite,
  onPractice,
  onClick,
  isReference = false,
}: SetCardProps) {
  const [imageError, setImageError] = useState(false);

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      zh: '中文',
      ja: '日本語',
      ko: '한국어',
    };
    return labels[lang] || lang;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(set);
    }
  };

  const getCoverImage = () => {
    if (imageError || !set.cover_image_url) {
      // Default cover based on language
      const defaultCovers: Record<string, string> = {
        zh: '📚',
        ja: '🎌',
        ko: '🇰🇷',
      };
      return (
        <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-6xl">
          {defaultCovers[set.language] || '📖'}
        </div>
      );
    }

    return (
      <img
        src={set.cover_image_url}
        alt={set.name}
        className="w-full h-32 object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Color accent bar */}
      <div className="w-full h-1.5" style={{ backgroundColor: set.color }} />

      {/* Cover Image */}
      <div className="relative">
        {getCoverImage()}

        {/* Favorite badge */}
        {set.is_favorite && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-amber-500/90 text-white border-0">
              <Star className="h-3 w-3 fill-current" />
            </Badge>
          </div>
        )}

        {/* Reference badge */}
        {isReference && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-blue-500/90 text-white border-0">
              <Share2 className="h-3 w-3" />
            </Badge>
          </div>
        )}

        {/* Action menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPractice(set); }}>
                <BookOpen className="mr-2 h-4 w-4" />
                Practice
              </DropdownMenuItem>
              {!isReference && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(set); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(set.id, !set.is_favorite);
                  }}>
                    {set.is_favorite ? (
                      <>
                        <StarOff className="mr-2 h-4 w-4" />
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Add to Favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(set); }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Set
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(set.id); }}>
                <Copy className="mr-2 h-4 w-4" />
                {isReference ? 'Make a Copy' : 'Duplicate Set'}
              </DropdownMenuItem>
              {!isReference && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(set.id); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Set
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card content */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{set.name}</CardTitle>
            {set.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {set.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.tag_name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {getLanguageLabel(set.language)}
              </Badge>
            </span>
            <span className="font-medium text-foreground">
              {set.word_count} {set.word_count === 1 ? 'word' : 'words'}
            </span>
          </div>
        </div>

        {/* Practice stats */}
        {set.total_practice_sessions > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center justify-between">
              <span>Practiced {set.total_practice_sessions}x</span>
              {set.last_practiced_at && (
                <span>
                  Last: {new Date(set.last_practiced_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick action button */}
        <Button
          className="w-full mt-2"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onPractice(set);
          }}
          disabled={set.word_count === 0}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Practice Now
        </Button>
      </CardContent>
    </Card>
  );
}
