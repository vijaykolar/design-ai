import { TOOL_MODE_ENUM, ToolModeType } from "@/constants/canvas";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  HandIcon,
  MinusIcon,
  MousePointerIcon,
  PlusIcon,
  Maximize2,
  Grid3x3,
  RotateCcw,
  MoveHorizontal,
  MoveVertical,
  Maximize,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState, useEffect } from "react";

type PropsType = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoomPercent: number;
  toolMode: ToolModeType;
  setToolMode: (toolMode: ToolModeType) => void;
};
const CanvasControls = ({
  zoomIn,
  zoomOut,
  resetZoom,
  zoomPercent,
  toolMode,
  setToolMode,
}: PropsType) => {
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen changes (e.g., F11 or ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleGrid = () => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);

    // Toggle grid visibility on canvas background
    const canvas = document.querySelector('[data-canvas-background="true"]') as HTMLElement;
    if (canvas) {
      canvas.style.backgroundImage = newShowGrid
        ? 'radial-gradient(circle, var(--primary) 1px, transparent 1px)'
        : 'none';
      canvas.style.backgroundSize = newShowGrid ? '20px 20px' : '';
    }
  };

  return (
    <div
      className="
   -translate-x-1/2 absolute bottom-4 left-1/2
   flex items-center gap-2 rounded-full border
   bg-black dark:bg-muted py-1.5 px-3 shadow-md text-white!
  "
    >
      {/* Tool Selection */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!",
                  toolMode === TOOL_MODE_ENUM.SELECT && "bg-white/20"
                )}
                onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
              >
                <MousePointerIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Select Tool (V)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!",
                  toolMode === TOOL_MODE_ENUM.HAND && "bg-white/20"
                )}
                onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
              >
                <HandIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Hand Tool (H / Space)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator orientation="vertical" className="h-5! bg-white/30" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!"
                )}
                onClick={() => zoomOut()}
              >
                <MinusIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom Out (-)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="min-w-12 text-center text-sm font-medium">
          {zoomPercent}%
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!"
                )}
                onClick={() => zoomIn()}
              >
                <PlusIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Zoom In (+)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!"
                )}
                onClick={() => resetZoom()}
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reset Zoom (0)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator orientation="vertical" className="h-5! bg-white/30" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!",
                  showGrid && "bg-white/20"
                )}
                onClick={toggleGrid}
              >
                <Grid3x3 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer hover:bg-white/20! text-white!",
                  isFullscreen && "bg-white/20"
                )}
                onClick={toggleFullscreen}
              >
                <Maximize className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Toggle Fullscreen (F11)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CanvasControls;
