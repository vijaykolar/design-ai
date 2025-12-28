"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Heart, Search, Store, Sparkles } from "lucide-react";
import { parseThemeColors } from "@/lib/theme";
import { useMarketplaceThemes, useLikeTheme, CustomTheme } from "@/features/use-custom-theme";
import { Spinner } from "@/components/ui/spinner";

interface ThemeMarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTheme: (themeId: string) => void;
  currentUserId?: string;
}

export function ThemeMarketplaceDialog({
  open,
  onOpenChange,
  onSelectTheme,
  currentUserId
}: ThemeMarketplaceDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: themes, isLoading } = useMarketplaceThemes();
  const likeMutation = useLikeTheme();

  // Extract all unique tags from themes
  const allTags = Array.from(
    new Set(themes?.flatMap(theme => theme.tags) || [])
  );

  // Filter themes based on search and tag
  const filteredThemes = themes?.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || theme.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleLike = async (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await likeMutation.mutateAsync(themeId);
  };

  const handleApplyTheme = (theme: CustomTheme) => {
    onSelectTheme(`custom-${theme.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/10">
              <Store className="size-5 text-purple-600" />
            </div>
            Theme Marketplace
          </DialogTitle>
          <DialogDescription>
            Discover and apply community-created themes to your project
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)] px-6 pb-6">
          {/* Search and Filters */}
          <div className="space-y-3 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="rounded-full h-8 text-xs shrink-0"
                  >
                    All
                  </Button>
                  {allTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className="rounded-full h-8 text-xs shrink-0"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Themes Grid */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : filteredThemes && filteredThemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4 pb-4">
                {filteredThemes.map((theme) => (
                  <ThemeMarketplaceItem
                    key={theme.id}
                    theme={theme}
                    onApply={() => handleApplyTheme(theme)}
                    onLike={(e) => handleLike(theme.id, e)}
                    isLiked={currentUserId ? theme.likedBy.includes(currentUserId) : false}
                    isLiking={likeMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Search className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No themes found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ThemeMarketplaceItemProps {
  theme: CustomTheme;
  onApply: () => void;
  onLike: (e: React.MouseEvent) => void;
  isLiked: boolean;
  isLiking: boolean;
}

function ThemeMarketplaceItem({ theme, onApply, onLike, isLiked, isLiking }: ThemeMarketplaceItemProps) {
  const colors = parseThemeColors(theme.style);

  return (
    <Card className="group relative hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate mb-1">{theme.name}</h3>
            {theme.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {theme.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLike}
            disabled={isLiking}
            className={cn(
              "shrink-0 ml-2 transition-colors",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("size-4", isLiked && "fill-current")} />
          </Button>
        </div>

        {/* Color Preview */}
        <div
          className="h-24 rounded-lg mb-3 p-3 flex items-center justify-center relative overflow-hidden border"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <div className="flex gap-2 relative z-10">
            <div
              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: colors.secondary }}
            />
            <div
              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="w-8 h-8 rounded-full shadow-md border-2 border-white"
              style={{ backgroundColor: colors.muted }}
            />
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            }}
          />
        </div>

        {/* Tags */}
        {theme.tags && theme.tags.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {theme.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {theme.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{theme.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Heart className="size-3" />
            <span>{theme.likes}</span>
          </div>
          <Button
            size="sm"
            onClick={onApply}
            className="rounded-full bg-linear-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
          >
            <Sparkles className="size-3 mr-1" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
