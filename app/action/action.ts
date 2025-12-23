"use server";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";
export async function generateProjectName(prompt: string) {
  // Simple logic to generate a project name based on the prompt
  try {
    const { text } = await generateText({
      model: openrouter.chat("google/gemini-2.5-flash-lite"),
      system:
        "You are a helpful assistant that generates short and catchy project names based on user prompts. - keep it under 5 words. - capitalize each word. - avoid special characters.",
      prompt,
    });

    return text?.trim() || "Untitled Project";
  } catch (error) {
    console.log("Error generating project name:", error);
    return "Untitled Project";
  }
}
