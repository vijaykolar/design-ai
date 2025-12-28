"use client";

import { CameraIcon, ChevronDown, Palette, Save, Wand2, CopyIcon, DownloadIcon, Edit3, Sparkles, Type, Layout, Image as ImageIcon } from "lucide-react";
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
  const { themes, theme: currentTheme, setTheme, frames } = useCanvas();
  const [promptText, setPromptText] = useState<string>("");
  const [isBatchExporting, setIsBatchExporting] = useState(false);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate, isPending } = useGenerateDesignById(projectId);

  const update = useUpdateProject(projectId);
  const duplicate = useDuplicateProject();

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

    mutate(prompt);
    savePromptToHistory(prompt);
    setPromptText("");
    setIsEditPopoverOpen(false);
  };

  const handleQuickEdit = (preset: typeof QUICK_EDITS[0]) => {
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
                      className="px-4  bg-linear-to-r
                       from-purple-500 to-indigo-600
                        text-white rounded-2xl
                        shadow-lg shadow-purple-200/50 cursor-pointer"
                    >
                      <Edit3 className="size-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Inline Edit (Cmd+E)</p>
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
                  <h3 className="text-sm font-semibold">AI Design Editor</h3>
                  <div className="text-xs text-muted-foreground">
                    Press Enter to apply
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
                              disabled={isPending}
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
                  disabled={isPending || !promptText.trim()}
                  className="w-full
                    bg-linear-to-r
                   from-purple-500 to-indigo-600
                    text-white rounded-xl
                    shadow-lg shadow-purple-200/50 cursor-pointer
                  "
                  onClick={() => handleAIGenerate()}
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4 mr-2" />
                      Apply Changes
                    </>
                  )}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-2 px-3 py-2">
                <Palette className="size-4" />
                <div className="flex gap-1.5">
                  {themes?.slice(0, 4)?.map((theme, index) => {
                    const color = parseThemeColors(theme.style);
                    return (
                      <div
                        role="button"
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(theme.id);
                        }}
                        className={cn(
                          `w-6.5 h-6.5 rounded-full cursor-pointer
                           `,
                          currentTheme?.id === theme.id &&
                            "ring-1 ring-offset-1"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  className="flex items-center gap-1 text-sm
                "
                >
                  +{themes?.length - 4} more
                  <ChevronDown className="size-4" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="px-0 rounded-xl
            shadow border
            "
            >
              <ThemeSelector />
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
    </div>
  );
};

export default CanvasFloatingToolbar;
