"use client";

import { CameraIcon, ChevronDown, Palette, Save, Wand2, CopyIcon, DownloadIcon, Edit3, Sparkles, Type, Layout, Image as ImageIcon, Plus, Store } from "lucide-react";
import { useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import PromptInput from "../prompt-input";
import { useState, useEffect, useRef } from "react";
import { parseThemeColors } from "@/lib/theme";
import ThemeSelector from "./theme-selector";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  useGenerateDesignById,
  useUpdateProject,
} from "@/features/use-project-id";
import { useDuplicateProject } from "@/features/use-project";
import { useRegenerateFrame } from "@/features/use-frame";
import { Spinner } from "../ui/spinner";
import JSZip from "jszip";
import { toast } from "sonner";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { Textarea } from "../ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ThemeCreatorDialog } from "./theme-creator-dialog";
import { ThemeMarketplaceDialog } from "./theme-marketplace-dialog";
import { useCreateCustomTheme } from "@/features/use-custom-theme";

// Quick edit presets for common design modifications
const QUICK_EDITS = [
  {
    id: 'modern',
    label: 'Modernize',
    icon: Sparkles,
    prompt: 'Make the design more modern with clean lines and contemporary styling'
  },
  {
    id: 'typography',
    label: 'Typography',
    icon: Type,
    prompt: 'Improve typography with better font hierarchy and readability'
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: Layout,
    prompt: 'Optimize the layout for better visual balance and spacing'
  },
  {
    id: 'visual',
    label: 'Visuals',
    icon: ImageIcon,
    prompt: 'Enhance visual elements with better imagery and graphics'
  },
];

const CanvasFloatingToolbar = ({
  projectId,
  isScreenshotting,
  onScreenshot,
}: {
  projectId: string;
  isScreenshotting: boolean;
  onScreenshot: () => void;
}) => {
  const {
    themes,
    theme: currentTheme,
    setTheme,
    frames,
    selectedFrameId,
    selectedFrame,
    updateFrame,
  } = useCanvas();
  const [promptText, setPromptText] = useState<string>("");
  const [isBatchExporting, setIsBatchExporting] = useState(false);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  const { mutate, isPending } = useGenerateDesignById(projectId);
  const regenerateFrameMutation = useRegenerateFrame(projectId);

  const update = useUpdateProject(projectId);
  const duplicate = useDuplicateProject();
  const createCustomTheme = useCreateCustomTheme();

  // Load recent prompts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`recent-prompts-${projectId}`);
    if (saved) {
      try {
        setRecentPrompts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent prompts', e);
      }
    }
  }, [projectId]);

  // Save recent prompts to localStorage
  const savePromptToHistory = (prompt: string) => {
    const updated = [prompt, ...recentPrompts.filter(p => p !== prompt)].slice(0, 5);
    setRecentPrompts(updated);
    localStorage.setItem(`recent-prompts-${projectId}`, JSON.stringify(updated));
  };

  const handleAIGenerate = (customPrompt?: string) => {
    const prompt = customPrompt || promptText;
    if (!prompt) return;

    // If a frame is selected, regenerate only that frame
    if (selectedFrameId && selectedFrame) {
      regenerateFrameMutation.mutate(
        { frameId: selectedFrameId, prompt },
        {
          onSuccess: () => {
            updateFrame(selectedFrameId, { isLoading: true });
            toast.success(`Regenerating "${selectedFrame.title}"`);
          },
          onError: () => {
            updateFrame(selectedFrameId, { isLoading: false });
          },
        }
      );
    } else {
      // No frame selected - show warning
      toast.error("Please select a frame to edit");
      return;
    }

    savePromptToHistory(prompt);
    setPromptText("");
    setIsEditPopoverOpen(false);
  };

  const handleQuickEdit = (preset: typeof QUICK_EDITS[0]) => {
    if (!selectedFrameId) {
      toast.error("Please select a frame to edit");
      return;
    }
    handleAIGenerate(preset.prompt);
    toast.info(`Applying ${preset.label}...`);
  };

  const handleUpdate = () => {
    if (!currentTheme) return;
    update.mutate(currentTheme.id);
  };

  const handleDuplicate = () => {
    duplicate.mutate(projectId);
  };

  const handleCreateTheme = async (themeData: {
    name: string;
    description: string;
    colors: Record<string, string>;
    isPublic: boolean;
    tags: string[];
  }) => {
    await createCustomTheme.mutateAsync(themeData);
  };

  // Focus textarea when popover opens
  useEffect(() => {
    if (isEditPopoverOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isEditPopoverOpen]);

  // Keyboard shortcut for opening inline edit (Cmd+E / Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+E or Ctrl+E to open inline edit
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        const target = e.target as HTMLElement;
        // Don't trigger if already typing in an input/textarea
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsEditPopoverOpen(prev => !prev);
      }

      // Escape to close popover
      if (e.key === 'Escape' && isEditPopoverOpen) {
        setIsEditPopoverOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditPopoverOpen]);

  const handleBatchExport = async () => {
    if (!frames || frames.length === 0) {
      toast.error("No frames to export");
      return;
    }

    setIsBatchExporting(true);
    try {
      const zip = new JSZip();

      // Add each frame as an HTML file to the zip
      frames.forEach((frame, index) => {
        const fullHtml = getHTMLWrapper(
          frame.htmlContent,
          frame.title,
          currentTheme?.style,
          frame.id
        );
        const fileName = `${index + 1}-${frame.title.replace(/\s+/g, "-").toLowerCase()}.html`;
        zip.file(fileName, fullHtml);
      });

      // Generate the zip file
      const blob = await zip.generateAsync({ type: "blob" });

      // Download the zip file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${projectId}-${Date.now()}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${frames.length} frames successfully`);
    } catch (error) {
      console.error("Batch export failed:", error);
      toast.error("Failed to export frames");
    } finally {
      setIsBatchExporting(false);
    }
  };

  return (
    <div
      className="
   fixed top-6 left-1/2 -translate-x-1/2 z-50
  "
    >
      <div
        className="w-full max-w-3xl bg-background
     dark:bg-gray-950 rounded-full shadow-xl border
    "
      >
        <div className="flex flex-row items-center gap-2 px-3">
          <Popover open={isEditPopoverOpen} onOpenChange={setIsEditPopoverOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon-sm"
                      className={cn(
                        "px-4 rounded-2xl shadow-lg cursor-pointer transition-all",
                        selectedFrameId
                          ? "bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-purple-200/50"
                          : "bg-muted text-muted-foreground shadow-sm hover:bg-muted/80"
                      )}
                    >
                      <Edit3 className="size-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {selectedFrameId
                      ? `AI Inline Edit (Cmd+E) - ${selectedFrame?.title}`
                      : "Select a frame to edit (Cmd+E)"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent
              className="w-[450px] p-4!
             rounded-xl! shadow-lg border mt-1
            "
              align="start"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold">AI Design Editor</h3>
                    {selectedFrame ? (
                      <p className="text-xs text-muted-foreground">
                        Editing: <span className="font-medium text-purple-600 dark:text-purple-400">{selectedFrame.title}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Select a frame to edit
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cmd+Enter
                  </div>
                </div>

                {/* Quick Edit Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_EDITS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <TooltipProvider key={preset.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!selectedFrameId || regenerateFrameMutation.isPending}
                              onClick={() => handleQuickEdit(preset)}
                              className="flex flex-col h-auto py-2 px-2 gap-1"
                            >
                              <Icon className="size-4" />
                              <span className="text-xs">{preset.label}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">{preset.prompt}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>

                <Separator />

                {/* Custom Prompt Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Custom Instructions
                  </label>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Describe your design changes..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleAIGenerate();
                      }
                    }}
                    className="min-h-[100px] resize-none ring-1 ring-purple-500/20
                      focus:ring-purple-500 rounded-lg"
                  />
                </div>

                {/* Recent Prompts */}
                {recentPrompts.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Recent Prompts
                    </label>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto">
                      {recentPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPromptText(prompt);
                            textareaRef.current?.focus();
                          }}
                          className="w-full text-left text-xs px-2 py-1.5 rounded-md
                            hover:bg-muted transition-colors truncate"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  disabled={!selectedFrameId || regenerateFrameMutation.isPending || !promptText.trim()}
                  className="w-full
                    bg-linear-to-r
                   from-purple-500 to-indigo-600
                    text-white rounded-xl
                    shadow-lg shadow-purple-200/50 cursor-pointer
                  "
                  onClick={() => handleAIGenerate()}
                >
                  {regenerateFrameMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4 mr-2" />
                      {selectedFrameId ? 'Apply Changes' : 'Select a Frame'}
                    </>
                  )}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent/50 rounded-full transition-colors group">
                <div className="p-1.5 rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                  <Palette className="size-4 text-purple-600" />
                </div>
                <div className="flex gap-1.5">
                  {themes?.slice(0, 4)?.map((theme, index) => {
                    const color = parseThemeColors(theme.style);
                    const isActive = currentTheme?.id === theme.id;
                    return (
                      <div
                        role="button"
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(theme.id);
                        }}
                        className={cn(
                          `w-7 h-7 rounded-full cursor-pointer
                           transition-all duration-200 hover:scale-110
                           shadow-sm border-2 border-white
                           `,
                          isActive &&
                            "ring-2 ring-offset-2 scale-110 shadow-md"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
                          boxShadow: isActive ? `0 0 0 2px ${color.primary}40` : undefined,
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground
                  group-hover:text-foreground transition-colors
                "
                >
                  +{themes?.length - 4}
                  <ChevronDown className="size-4" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="px-0 rounded-xl
            shadow-lg border
            "
              align="center"
            >
              <ThemeSelector />
              <Separator className="my-2" />
              <div className="px-4 pb-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsThemeCreatorOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Create Theme
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsMarketplaceOpen(true);
                  }}
                >
                  <Store className="size-4" />
                  Marketplace
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <Separator orientation="vertical" className="h-4!" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              disabled={isScreenshotting}
              onClick={onScreenshot}
            >
              {isScreenshotting ? (
                <Spinner />
              ) : (
                <CameraIcon className="size-4.5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              disabled={isBatchExporting}
              onClick={handleBatchExport}
            >
              {isBatchExporting ? (
                <Spinner />
              ) : (
                <DownloadIcon className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              disabled={duplicate.isPending}
              onClick={handleDuplicate}
            >
              {duplicate.isPending ? (
                <Spinner />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-full cursor-pointer"
              onClick={handleUpdate}
            >
              {update.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Save className="size-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Theme Creator Dialog */}
      <ThemeCreatorDialog
        open={isThemeCreatorOpen}
        onOpenChange={setIsThemeCreatorOpen}
        onCreateTheme={handleCreateTheme}
      />

      {/* Theme Marketplace Dialog */}
      <ThemeMarketplaceDialog
        open={isMarketplaceOpen}
        onOpenChange={setIsMarketplaceOpen}
        onSelectTheme={setTheme}
      />
    </div>
  );
};

export default CanvasFloatingToolbar;
