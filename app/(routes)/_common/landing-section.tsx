"use client";

import { useState } from "react";
import Header from "./header";
import PromptInput from "@/components/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

const LandingSection = () => {
  const [promptText, setPromptText] = useState<string>("");
  const suggestions = [
    {
      label: "Fitness tracker",
      icon: "🏃",
      value:
        "Fitness app dashboard with daily steps, heart rate monitor, and a summary of weekly workout progress.",
    },
    {
      label: "E-commerce store",
      icon: "🛍️",
      value:
        "Product listing page for a high-end fashion store with filters, categories, and high-quality image thumbnails.",
    },
    {
      label: "Social media",
      icon: "📸",
      value:
        "Social media profile page featuring a user bio, grid of photos, and follower statistics.",
    },
  ];
  const handleSuggestionClick = (suggestion: string) => {
    setPromptText(suggestion);
  };
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col">
        <Header />
        <div className="relative overflow-hidden pt-28">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
            <div className="space-y-3">
              <h1 className="text-center font-semibold text-4xl tracking-tight sm:text-5xl">
                Design mobile apps <br className="md:hidden" />{" "}
                <span className="text-primary">in minutes</span>
              </h1>
              <p className="text-center leading-relaxed text-foreground mx-auto max-w-2xl font-medium">
                Create stunning designs with the power of AI. Our platform uses
                advanced machine learning algorithms to generate unique and
                visually appealing designs for your projects.
              </p>
            </div>
            <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-8 relative z-50">
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary "
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={false}
                  onSubmit={() => {}}
                  // hideSubmitBtn={true}
                />
              </div>
              <div className="flex flex-wrap justify-center px-5 gap-2">
                <Suggestions>
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick(suggestion.value)}
                      className="text-xs!"
                      suggestion={suggestion.label}
                    >
                      {suggestion.icon} {suggestion.label}
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSection;
