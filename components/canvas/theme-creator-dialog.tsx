"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

interface ThemeCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTheme: (theme: {
    name: string;
    description: string;
    colors: Record<string, string>;
    isPublic: boolean;
    tags: string[];
  }) => Promise<void>;
}

const DEFAULT_COLORS = {
  background: "#ffffff",
  foreground: "#111827",
  card: "#ffffff",
  "card-foreground": "#111827",
  popover: "#ffffff",
  "popover-foreground": "#111827",
  primary: "#3b82f6",
  "primary-rgb": "59, 130, 246",
  "primary-foreground": "#ffffff",
  secondary: "#e5e7eb",
  "secondary-foreground": "#1f2937",
  accent: "#dbeafe",
  "accent-foreground": "#1e293b",
  muted: "#f3f4f6",
  "muted-foreground": "#6b7280",
  destructive: "#ef4444",
  border: "#e5e7eb",
  input: "#e5e7eb",
  ring: "#3b82f6",
  radius: "0.75rem",
};

const COLOR_FIELDS = [
  { key: "background", label: "Background", description: "Main background color" },
  { key: "foreground", label: "Foreground", description: "Main text color" },
  { key: "primary", label: "Primary", description: "Primary brand color" },
  { key: "primary-foreground", label: "Primary Text", description: "Text on primary color" },
  { key: "secondary", label: "Secondary", description: "Secondary color" },
  { key: "secondary-foreground", label: "Secondary Text", description: "Text on secondary" },
  { key: "accent", label: "Accent", description: "Accent color" },
  { key: "accent-foreground", label: "Accent Text", description: "Text on accent" },
  { key: "muted", label: "Muted", description: "Muted background" },
  { key: "muted-foreground", label: "Muted Text", description: "Muted text color" },
  { key: "card", label: "Card", description: "Card background" },
  { key: "card-foreground", label: "Card Text", description: "Card text color" },
  { key: "destructive", label: "Destructive", description: "Error/danger color" },
  { key: "border", label: "Border", description: "Border color" },
  { key: "ring", label: "Ring", description: "Focus ring color" },
];

export function ThemeCreatorDialog({ open, onOpenChange, onCreateTheme }: ThemeCreatorDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));

    // Auto-update RGB value for primary color
    if (key === "primary") {
      const rgb = hexToRgb(value);
      if (rgb) {
        setColors(prev => ({ ...prev, "primary-rgb": `${rgb.r}, ${rgb.g}, ${rgb.b}` }));
      }
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateTheme({
        name: name.trim(),
        description: description.trim(),
        colors,
        isPublic,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });

      // Reset form
      setName("");
      setDescription("");
      setColors(DEFAULT_COLORS);
      setIsPublic(false);
      setTags("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create theme:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Palette className="size-5 text-purple-600" />
            </div>
            Create Custom Theme
          </DialogTitle>
          <DialogDescription>
            Design your own color theme with custom variables. Share it with the community or keep it private.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="space-y-6 px-6 py-4">
            {/* Theme Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  placeholder="My Awesome Theme"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-description">Description (optional)</Label>
                <Textarea
                  id="theme-description"
                  placeholder="Describe your theme..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-tags">Tags (optional, comma-separated)</Label>
                <Input
                  id="theme-tags"
                  placeholder="dark, modern, minimal"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-toggle" className="text-base font-semibold">
                        Share with Community
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Make this theme available in the marketplace
                      </p>
                    </div>
                    <Switch
                      id="public-toggle"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Color Palette */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-purple-600" />
                <h3 className="font-semibold">Color Palette</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COLOR_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        id={field.key}
                        value={colors[field.key] || "#000000"}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        className="w-12 h-10 rounded-md border cursor-pointer"
                      />
                      <Input
                        value={colors[field.key] || ""}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        placeholder="#000000"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </div>
                ))}

                {/* Radius */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="radius" className="text-sm font-medium">
                    Border Radius
                  </Label>
                  <Input
                    id="radius"
                    value={colors.radius || "0.75rem"}
                    onChange={(e) => handleColorChange("radius", e.target.value)}
                    placeholder="0.75rem"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Border radius for UI elements</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold">Preview</h3>
              <Card
                className="border-2"
                style={{
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: colors.border,
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Button
                      className="font-medium"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors["primary-foreground"],
                        borderRadius: colors.radius,
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="secondary"
                      className="font-medium ml-2"
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors["secondary-foreground"],
                        borderRadius: colors.radius,
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                  <Card
                    style={{
                      backgroundColor: colors.card,
                      color: colors["card-foreground"],
                      borderRadius: colors.radius,
                    }}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Card Component</h4>
                      <p style={{ color: colors["muted-foreground"] }}>
                        This is how your theme will look in practice.
                      </p>
                      <div
                        className="mt-2 inline-block px-3 py-1 rounded text-sm"
                        style={{
                          backgroundColor: colors.accent,
                          color: colors["accent-foreground"],
                        }}
                      >
                        Accent Badge
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Create Theme
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
