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
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
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

        <div className="flex flex-col min-h-0 flex-1 px-6 pb-6">
          {/* Search and Filters */}
          <div className="space-y-3 pb-4 shrink-0">
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

          {/* Themes List - Single Column with Scroll */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : filteredThemes && filteredThemes.length > 0 ? (
              <div className="space-y-3 pr-4 pb-4">
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
    <Card className="overflow-hidden border-2">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Vertical Color Palette - ColorHunt Style */}
          <div className="relative shrink-0">
            <div className="w-16 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
              {/* Vertical color strips */}
              <div className="flex h-full">
                {/* Primary color */}
                <div
                  className="flex-1 transition-all hover:flex-[1.2]"
                  style={{ backgroundColor: colors.primary }}
                  title="Primary"
                />
                {/* Secondary color */}
                <div
                  className="flex-1 transition-all hover:flex-[1.2]"
                  style={{ backgroundColor: colors.secondary }}
                  title="Secondary"
                />
                {/* Accent color */}
                <div
                  className="flex-1 transition-all hover:flex-[1.2]"
                  style={{ backgroundColor: colors.accent }}
                  title="Accent"
                />
                {/* Muted color */}
                <div
                  className="flex-1 transition-all hover:flex-[1.2]"
                  style={{ backgroundColor: colors.muted }}
                  title="Muted"
                />
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with Like button */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1 truncate">
                  {theme.name}
                </h3>
                {theme.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                )}
              </div>

              {/* Like button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onLike}
                disabled={isLiking}
                className={cn(
                  "shrink-0 rounded-full shadow-md",
                  isLiked
                    ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <Heart
                  className="size-5"
                  fill={isLiked ? "currentColor" : "none"}
                />
              </Button>
            </div>

            {/* Tags */}
            {theme.tags && theme.tags.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {theme.tags.slice(0, 4).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {theme.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{theme.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLike}
                  disabled={isLiking}
                  className={cn(
                    "h-8 gap-1.5 px-3 rounded-full transition-colors",
                    isLiked
                      ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      : "text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  )}
                >
                  <Heart
                    className="size-4"
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  <span className="text-sm font-medium">{theme.likes}</span>
                </Button>
              </div>
              <Button
                size="sm"
                onClick={onApply}
                className="rounded-full bg-linear-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-md px-4 h-8"
              >
                <Sparkles className="size-3 mr-1.5" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
