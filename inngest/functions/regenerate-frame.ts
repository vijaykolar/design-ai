/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { FrameType } from "@/types/project";
import { GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/theme";
import { unsplashTool } from "../tool";

export const regenerateFrame = inngest.createFunction(
  { id: "regenerate-single-frame" },
  { event: "ui/regenerate.frame" },

  async ({ event, step, publish }: any) => {
    const { userId, projectId, frameId, prompt, theme, existingFrames } =
      event.data;
    const CHANNEL = `user:${userId}`;

    await publish({
      channel: CHANNEL,
      topic: "regeneration.start",
      data: {
        status: "regenerating",
        projectId: projectId,
        frameId: frameId,
      },
    });

    // Get the frame to regenerate
    const frameToRegenerate = await prisma.frame.findUnique({
      where: { id: frameId },
    });

    if (!frameToRegenerate) {
      await publish({
        channel: CHANNEL,
        topic: "regeneration.error",
        data: {
          status: "error",
          error: "Frame not found",
          projectId: projectId,
          frameId: frameId,
        },
      });
      throw new Error("Frame not found");
    }

    await step.run("regenerate-frame", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === theme);

      // Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get all other frames for context (excluding the one being regenerated)
      const otherFrames = existingFrames.filter(
        (f: FrameType) => f.id !== frameId
      );
      const previousFramesContext = otherFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

      const result = await generateText({
        model: "google/gemini-3-pro-preview",
        system: GENERATION_SYSTEM_PROMPT,
        tools: {
          searchUnsplash: unsplashTool,
        },
        stopWhen: stepCountIs(5),
        prompt: `
          REGENERATE THIS SCREEN:
          - Screen Name: ${frameToRegenerate.title}
          - User Request: ${prompt}
          - Original HTML for reference: ${frameToRegenerate.htmlContent}

          EXISTING SCREENS REFERENCE (Maintain consistency with these):
          ${previousFramesContext || "No other screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

          CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          ${
            otherFrames.length > 0
              ? `
          - **CONSISTENCY IS CRITICAL: This screen MUST match the existing screens exactly in style
          - **COPY the EXACT same fonts, font sizes, and font weights from existing screens
          - **COPY the EXACT same color palette - do NOT use different shades or tones
          - **COPY the EXACT bottom navigation component structure and styling if it exists - do NOT recreate it
          - **COPY the EXACT header/toolbar structure and styling if it exists
          - **COPY common components (cards, buttons, headers, inputs) and their EXACT styling
          - **Maintain the EXACT same visual hierarchy, spacing patterns, padding, and margins
          - **Use the EXACT same border radius, shadows, and other visual effects
          - **This screen MUST look like it was designed by the same person at the same time as the existing screens
          - **DO NOT introduce new design patterns, fonts, or styling that doesn't exist in previous screens
          `
              : "- **Maintain the existing design system from the original screen"
          }

          1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
            Use Tailwind classes for layout, spacing, typography, shadows, etc.
            Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
          2. **All content must be inside a single root <div> that controls the layout.**
            - No overflow classes on the root.
            - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
          3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
            - Use \`relative w-full h-screen\` on the top div of the overlay.
          4. **For regular content:**
            - Use \`w-full h-full min-h-screen\` on the top div.
          5. **Do not use h-screen on inner content unless absolutely required.**
            - Height must grow with content; content must be fully visible inside an iframe.
          6. **For z-index layering:**
            - Ensure absolute elements do not block other content unnecessarily.
          7. **Output raw HTML only, starting with <div>.**
            - Do not include markdown, comments, <html>, <body>, or <head>.
          8. **Hardcode a style only if a theme variable is not needed for that element.**
          9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
          Generate the complete, production-ready HTML for this screen now
        `.trim(),
      });

      let finalHtml = result.text ?? "";
      const match = finalHtml.match(/<div[\s\S]*<\/div>/);
      finalHtml = match ? match[0] : finalHtml;
      finalHtml = finalHtml.replace(/```/g, "");

      // Update the frame with the new HTML
      const updatedFrame = await prisma.frame.update({
        where: { id: frameId },
        data: {
          htmlContent: finalHtml,
        },
      });

      await publish({
        channel: CHANNEL,
        topic: "frame.regenerated",
        data: {
          frame: updatedFrame,
          projectId: projectId,
        },
      });

      return { success: true, frame: updatedFrame };
    });

    await publish({
      channel: CHANNEL,
      topic: "regeneration.complete",
      data: {
        status: "completed",
        projectId: projectId,
        frameId: frameId,
      },
    });
  }
);
