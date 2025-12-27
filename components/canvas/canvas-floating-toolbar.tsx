"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "../ui/button";
import { ChevronDown, PaletteIcon, Wand2Icon } from "lucide-react";
import PromptInput from "../prompt-input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { parseThemeColors } from "@/lib/theme";
import { useCanvas } from "@/context/canvas-context";
import ThemeSelector from "./theme-selector";

const CanvasFloatingToolbar = () => {
  const { themes, theme: currentTheme, setTheme } = useCanvas();
  const [promptText, setPromptText] = useState<string>("");
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-1">
      <div className="w-full max-w-2xl bg-background dark:bg-gray-900 rounded-full shadow-xl border">
        <div className="flex items-center flex-row gap-2 px-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon-sm"
                className="px-4 from-purple-500 to-indigo-600 bg-linear-to-r rounded-4xl shadow-purple-200/50 cursor-pointer"
              >
                <Wand2Icon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-4!
             rounded-xl! shadow-lg border mt-1"
            >
              <PromptInput
                promptText={promptText}
                setPromptText={setPromptText}
                className="min-h-37.5 ring-1! 
                rounded-xl! shadow-none border-muted
                "
                hideSubmitBtn={true}
              />
              <Button
                // disabled={isPending}
                className="mt-2 w-full
                  bg-linear-to-r
                  rounded-full
                   cursor-pointer
                "
                // onClick={handleAIGenerate}
              >
                {/* {isPending ? <Spinner /> : <>Design</>} */}
                Design
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-2 px-3 py-2">
                <PaletteIcon className="size-4" />
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
        </div>
      </div>
    </div>
  );
};

export default CanvasFloatingToolbar;
