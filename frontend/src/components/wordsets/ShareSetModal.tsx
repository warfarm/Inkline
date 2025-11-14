import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Copy, Check, Globe, Link as LinkIcon, BarChart } from 'lucide-react';
import type { WordSet } from '@/types';

interface ShareSetModalProps {
  open: boolean;
  onClose: () => void;
  set: WordSet;
}

export function ShareSetModal({ open, onClose, set }: ShareSetModalProps) {
  const [shareToken, setShareToken] = useState<string | null>(set.share_token || null);
  const [isPublic, setIsPublic] = useState(set.is_public);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ views: 0, copies: 0 });

  const shareUrl = shareToken
    ? `${window.location.origin}/sets/shared/${shareToken}`
    : '';

  useEffect(() => {
    if (open && set.share_token) {
      fetchShareStats();
    }
  }, [open, set.share_token]);

  const fetchShareStats = async () => {
    try {
      const { data, error } = await supabase
        .from('word_set_shares')
        .select('view_count, copy_count')
        .eq('set_id', set.id)
        .eq('share_type', 'public')
        .single();

      if (error) throw error;

      if (data) {
        setStats({
          views: data.view_count || 0,
          copies: data.copy_count || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching share stats:', err);
    }
  };

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Generate share token
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        'generate_share_token'
      );

      if (tokenError) throw tokenError;

      // Update set with token and make public
      const { error: updateError } = await supabase
        .from('word_sets')
        .update({
          share_token: tokenData,
          is_public: true,
        })
        .eq('id', set.id);

      if (updateError) throw updateError;

      // Create share record
      const { error: shareError } = await supabase
        .from('word_set_shares')
        .insert({
          set_id: set.id,
          shared_by_user_id: set.user_id,
          share_type: 'public',
          permissions: 'copy',
        });

      if (shareError) throw shareError;

      setShareToken(tokenData);
      setIsPublic(true);
      toast.success('Share link generated!');
    } catch (err) {
      console.error('Error generating share link:', err);
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');

    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeAccess = async () => {
    if (!confirm('Are you sure you want to revoke public access? The share link will stop working.')) {
      return;
    }

    setLoading(true);
    try {
      // Make set private
      const { error: updateError } = await supabase
        .from('word_sets')
        .update({ is_public: false })
        .eq('id', set.id);

      if (updateError) throw updateError;

      // Delete share records
      const { error: deleteError } = await supabase
        .from('word_set_shares')
        .delete()
        .eq('set_id', set.id)
        .eq('share_type', 'public');

      if (deleteError) throw deleteError;

      setIsPublic(false);
      toast.success('Public access revoked');
    } catch (err) {
      console.error('Error revoking access:', err);
      toast.error('Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Set</DialogTitle>
          <DialogDescription>
            Share "{set.name}" with others via a public link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Set Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${set.color}30, ${set.color}10)`,
                  }}
                >
                  {set.cover_image_url?.startsWith('emoji:')
                    ? set.cover_image_url.replace('emoji:', '')
                    : '📖'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{set.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {set.word_count} {set.word_count === 1 ? 'word' : 'words'}
                  </div>
                </div>
                <Badge variant={isPublic ? 'default' : 'secondary'}>
                  {isPublic ? (
                    <>
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    'Private'
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {!shareToken ? (
            /* Generate Link */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <LinkIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Share this set publicly</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a public link that anyone can use to view and copy this set.
                  Your set will also appear in the public library.
                </p>
              </div>
              <Button onClick={generateShareLink} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </div>
          ) : (
            /* Share Link and Stats */
            <div className="space-y-4">
              {/* Link */}
              <div>
                <Label htmlFor="share-link" className="mb-2 block">
                  Share Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Anyone with this link can view and copy your set
                </p>
              </div>

              {/* Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Share Statistics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{stats.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stats.copies}</div>
                      <div className="text-xs text-muted-foreground">Copies</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions info */}
              <div className="bg-muted/50 rounded-md p-3 text-sm space-y-2">
                <p className="font-semibold">What others can do:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>View your set and all words in it</li>
                  <li>Copy the set to their own account</li>
                  <li>Practice with their copied set</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  They cannot edit your original set.
                </p>
              </div>

              {/* Revoke access */}
              <Button
                variant="outline"
                onClick={handleRevokeAccess}
                disabled={loading}
                className="w-full text-destructive hover:text-destructive"
              >
                Revoke Public Access
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
