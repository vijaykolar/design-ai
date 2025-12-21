"use client";

import { cn } from "@/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "./ui/input-group";
import { Spinner } from "./ui/spinner";
import { CornerDownLeftIcon } from "lucide-react";

interface PromptInputProps {
  className?: string;
  promptText: string;
  setPromptText: (text: string) => void;
  isLoading?: boolean;
  onSubmit?: () => void;
  hideSubmitBtn?: boolean;
}

const PromptInput = ({
  className,
  promptText,
  setPromptText,
  isLoading,
  onSubmit,
  hideSubmitBtn = false,
}: PromptInputProps) => {
  return (
    <div className="bg-backgrounwd">
      <InputGroup
        className={cn("min-h-[172px] rounded-3xl bg-backgrouwnd", className)}
      >
        <InputGroupTextarea
          className="text-base! py-2.5!"
          value={promptText}
          placeholder="I want to design a mobile app"
          onChange={(e) => setPromptText(e.target.value)}
        />
        <InputGroupAddon
          align="block-end"
          className="flex items-center justify-end"
        >
          {!hideSubmitBtn && (
            <InputGroupButton
              variant="default"
              className="ml-2"
              size="sm"
              disabled={!promptText?.trim() || isLoading}
              onClick={onSubmit}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  Design <CornerDownLeftIcon className="size-4" />
                </>
              )}
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PromptInput;
