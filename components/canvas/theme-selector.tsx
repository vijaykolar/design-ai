"use client";

import { useCanvas } from "@/context/canvas-context";
import { parseThemeColors, ThemeType } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { CheckIcon, Palette, Sparkles, Crown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ThemeSelector = () => {
  const { themes, theme: currentTheme, setTheme } = useCanvas();

  // Separate built-in and custom themes
  const builtInThemes = themes?.filter(t => !t.isCustom) || [];
  const customThemes = themes?.filter(t => t.isCustom) || [];

  return (
    <div className="flex flex-col max-h-96 ">
      <div className="flex-1 pb-3 px-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pt-2">
          <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/10">
            <Palette className="size-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Choose a Theme</h3>
            <p className="text-xs text-muted-foreground">
              {themes?.length} beautiful themes available
            </p>
          </div>
        </div>

        {/* Custom Themes Section */}
        {customThemes.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="size-3.5 text-purple-600" />
              <h4 className="text-sm font-semibold">Custom Themes</h4>
              <span className="text-xs text-muted-foreground">({customThemes.length})</span>
            </div>
            <div className="space-y-2 mb-4">
              {customThemes.map((theme) => (
                <ThemeItem
                  key={theme.id}
                  theme={theme}
                  isSelected={currentTheme?.id === theme.id}
                  onSelect={() => setTheme(theme.id)}
                />
              ))}
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Built-in Themes Section */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-3.5 text-purple-600" />
          <h4 className="text-sm font-semibold">Built-in Themes</h4>
          <span className="text-xs text-muted-foreground">({builtInThemes.length})</span>
        </div>
        <div className="space-y-2">
          {builtInThemes.map((theme) => (
            <ThemeItem
              key={theme.id}
              theme={theme}
              isSelected={currentTheme?.id === theme.id}
              onSelect={() => setTheme(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function ThemeItem({
  theme,
  isSelected,
  onSelect,
}: {
  theme: ThemeType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = parseThemeColors(theme.style);
  return (
    <button
      onClick={onSelect}
      className={cn(
        `group relative flex items-center justify-between w-full
        p-3 rounded-xl border gap-4 bg-background
        hover:shadow-md hover:scale-[1.02]
        transition-all duration-200 overflow-hidden
        `,
        isSelected
          ? "border-2 shadow-md ring-2 ring-offset-1"
          : "border hover:border-primary/30"
      )}
      style={{
        borderColor: isSelected ? color.primary : "",
        boxShadow: isSelected
          ? `0 0 0 2px ${color.primary}40, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
          : undefined,
      }}
    >
      {/* Gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
        }}
      />

      {/* Color swatches with gradient */}
      <div className="flex gap-1.5 relative z-10">
        {["primary", "secondary", "accent", "muted"].map((key, idx) => (
          <div
            key={key}
            className={cn(
              "w-5 h-5 rounded-full border-2 border-white shadow-sm",
              "transition-transform duration-200",
              isSelected && "animate-pulse"
            )}
            style={{
              backgroundColor: color[key],
              transform: isSelected ? `scale(${1 + idx * 0.05})` : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Theme name and check icon */}
      <div className="flex items-center gap-2 flex-1 relative z-10">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isSelected && "font-semibold"
          )}
        >
          {theme.name}
        </span>
      </div>

      {/* Sparkle icon for selected theme */}
      {isSelected && (
        <Sparkles
          className="absolute top-2 right-2 size-3 animate-pulse opacity-50"
          style={{ color: color.accent }}
        />
      )}

      {/* Custom theme badge */}
      {theme.isCustom && (
        <Crown
          className="absolute top-2 left-2 size-3 text-purple-600 opacity-60"
        />
      )}
    </button>
  );
}

export default ThemeSelector;
